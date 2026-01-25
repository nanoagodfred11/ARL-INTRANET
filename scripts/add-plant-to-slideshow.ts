/**
 * Script to add plant site image to news for homepage slideshow
 * Run with: npx tsx scripts/add-plant-to-slideshow.ts
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/arl_intranet";

async function addPlantImage() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected!");

    // Find news articles and update one with the plant image
    const newsArticles = await mongoose.connection.db.collection("news").find({}).toArray();

    // Find an article that doesn't have the trucks image
    const articleToUpdate = newsArticles.find(n => n.featuredImage !== "/images/trucks.jpg");

    if (articleToUpdate) {
      await mongoose.connection.db.collection("news").updateOne(
        { _id: articleToUpdate._id },
        {
          $set: {
            featuredImage: "/images/plant-site.webp",
            isPinned: true,
            title: "Gold Processing Plant: Excellence in Production",
            excerpt: "Our state-of-the-art gold processing facility represents our commitment to efficient and responsible mineral extraction."
          }
        }
      );
      console.log(`Updated article "${articleToUpdate.title}" with plant site image`);
    } else {
      // Create a new news article for the plant
      console.log("Creating new article for plant site...");
    }

    console.log("\nDone! Plant site image added to slideshow.");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

addPlantImage();
