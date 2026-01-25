/**
 * Script to add trucks image to news for homepage slideshow
 * Run with: npx tsx scripts/add-trucks-to-slideshow.ts
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/arl_intranet";

async function addTrucksImage() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected!");

    // Update the first news article to use the trucks image and mark as pinned for slideshow
    const result = await mongoose.connection.db.collection("news").updateOne(
      { slug: { $exists: true } },
      {
        $set: {
          featuredImage: "/images/trucks.jpg",
          isPinned: true,
          title: "Our Fleet: Powering Mining Operations",
          excerpt: "Our fleet of Liebherr haul trucks represents our commitment to operational excellence and efficiency in gold mining operations."
        }
      },
      { sort: { createdAt: -1 } }
    );

    console.log(`Updated news article with trucks image: ${result.modifiedCount}`);

    // Also add another news with the trucks image
    const existingNews = await mongoose.connection.db.collection("news").find({}).limit(3).toArray();
    if (existingNews.length >= 2) {
      await mongoose.connection.db.collection("news").updateOne(
        { _id: existingNews[1]._id },
        {
          $set: {
            featuredImage: "/images/trucks.jpg"
          }
        }
      );
      console.log("Added trucks image to second news article as well");
    }

    console.log("\nDone! Trucks image added to slideshow.");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

addTrucksImage();
