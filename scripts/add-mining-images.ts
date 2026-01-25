/**
 * Script to add mining-related images to database records
 * Run with: npx tsx scripts/add-mining-images.ts
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/arl_intranet";

// Mining-related images from Unsplash - Gold mining, heavy equipment, African mining operations
const miningImages = {
  // News images - gold mining operations, dump trucks, processing plants
  news: [
    "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200&h=800&fit=crop", // Mining dump truck
    "https://images.unsplash.com/photo-1578496479763-c21c718af028?w=1200&h=800&fit=crop", // Gold/mining
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop", // Open pit mine
    "https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?w=1200&h=800&fit=crop", // Mining equipment
    "https://images.unsplash.com/photo-1597931752949-98c74b5b159f?w=1200&h=800&fit=crop", // Excavator mining
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&h=800&fit=crop", // Mining haul truck
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&h=800&fit=crop", // Heavy machinery
  ],

  // Event images - corporate, team meetings, African business
  events: [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop", // Corporate event
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&h=800&fit=crop", // Team meeting
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop", // Business workshop
    "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=1200&h=800&fit=crop", // Conference
  ],

  // Safety tips images - PPE, mining safety, hard hats, high visibility
  safetyTips: [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=800&fit=crop", // Construction worker safety
    "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=1200&h=800&fit=crop", // Yellow hard hat
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=800&fit=crop", // Construction site
    "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=1200&h=800&fit=crop", // Worker with PPE
    "https://images.unsplash.com/photo-1605152276897-4f618f831968?w=1200&h=800&fit=crop", // Safety equipment
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=800&fit=crop", // Industrial worker
    "https://images.unsplash.com/photo-1574757988281-66e319c5f17b?w=1200&h=800&fit=crop", // Safety vest worker
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop", // Mining operation
  ],

  // Safety videos thumbnails
  safetyVideos: [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=450&fit=crop", // Safety training
    "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&h=450&fit=crop", // Hard hat PPE
    "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=450&fit=crop", // Worker safety
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=450&fit=crop", // Worksite
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=450&fit=crop", // Industrial
  ],

  // Album covers - mining operations, community, corporate
  albums: [
    "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&h=600&fit=crop", // Mining truck
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop", // Corporate event
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop", // Team community
  ],
};

async function addMiningImages() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected!");

    // Update News with mining images
    const news = await mongoose.connection.db.collection("news").find({}).toArray();
    for (let i = 0; i < news.length; i++) {
      const imageUrl = miningImages.news[i % miningImages.news.length];
      await mongoose.connection.db.collection("news").updateOne(
        { _id: news[i]._id },
        { $set: { featuredImage: imageUrl } }
      );
    }
    console.log(`Updated ${news.length} news articles with mining images`);

    // Update Events with corporate/mining images
    const events = await mongoose.connection.db.collection("events").find({}).toArray();
    for (let i = 0; i < events.length; i++) {
      const imageUrl = miningImages.events[i % miningImages.events.length];
      await mongoose.connection.db.collection("events").updateOne(
        { _id: events[i]._id },
        { $set: { featuredImage: imageUrl } }
      );
    }
    console.log(`Updated ${events.length} events with corporate images`);

    // Update Safety Tips with safety images
    const safetyTips = await mongoose.connection.db.collection("safetytips").find({}).toArray();
    for (let i = 0; i < safetyTips.length; i++) {
      const imageUrl = miningImages.safetyTips[i % miningImages.safetyTips.length];
      await mongoose.connection.db.collection("safetytips").updateOne(
        { _id: safetyTips[i]._id },
        { $set: { featuredImage: imageUrl } }
      );
    }
    console.log(`Updated ${safetyTips.length} safety tips with safety images`);

    // Update Safety Videos with thumbnails
    const safetyVideos = await mongoose.connection.db.collection("safetyvideos").find({}).toArray();
    for (let i = 0; i < safetyVideos.length; i++) {
      const imageUrl = miningImages.safetyVideos[i % miningImages.safetyVideos.length];
      await mongoose.connection.db.collection("safetyvideos").updateOne(
        { _id: safetyVideos[i]._id },
        { $set: { thumbnail: imageUrl } }
      );
    }
    console.log(`Updated ${safetyVideos.length} safety videos with thumbnails`);

    // Update Albums with cover images
    const albums = await mongoose.connection.db.collection("albums").find({}).toArray();
    for (let i = 0; i < albums.length; i++) {
      const imageUrl = miningImages.albums[i % miningImages.albums.length];
      await mongoose.connection.db.collection("albums").updateOne(
        { _id: albums[i]._id },
        { $set: { coverImage: imageUrl } }
      );
    }
    console.log(`Updated ${albums.length} albums with cover images`);

    console.log("\nDone! All records updated with mining-related images.");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

addMiningImages();
