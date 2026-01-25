import mongoose from "mongoose";

async function fix() {
  await mongoose.connect("mongodb://localhost:27017/arl_intranet");

  // Update plant site image to webp
  const result = await mongoose.connection.db.collection("news").updateOne(
    { title: "Gold Processing Plant: Excellence in Production" },
    { $set: { featuredImage: "/images/plant-site.webp", isPinned: true } }
  );
  console.log("Updated plant site:", result.modifiedCount);

  // List all pinned news with images
  const news = await mongoose.connection.db.collection("news").find({ isPinned: true }).toArray();
  console.log("\nPinned news for slideshow:");
  news.forEach(n => console.log(`- "${n.title}" -> ${n.featuredImage}`));

  await mongoose.disconnect();
}

fix();
