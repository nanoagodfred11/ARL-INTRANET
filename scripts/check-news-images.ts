/**
 * Check news images in database
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/arl_intranet";

async function checkImages() {
  try {
    await mongoose.connect(MONGODB_URI);

    const news = await mongoose.connection.db.collection("news").find({}).toArray();

    console.log("News articles and their images:");
    news.forEach((n, i) => {
      console.log(`${i + 1}. "${n.title}" - isPinned: ${n.isPinned} - Image: ${n.featuredImage || "NONE"}`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

checkImages();
