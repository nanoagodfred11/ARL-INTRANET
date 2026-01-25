import mongoose from "mongoose";

async function update() {
  await mongoose.connect("mongodb://localhost:27017/arl_intranet");

  const result = await mongoose.connection.db.collection("news").updateOne(
    { title: "Gold Processing Plant: Excellence in Production" },
    { $set: { featuredImage: "/images/plant-site.jpg", isPinned: true } }
  );

  console.log("Updated:", result.modifiedCount);

  // Show all pinned news
  const pinned = await mongoose.connection.db.collection("news").find({ isPinned: true }).toArray();
  console.log("\nPinned news in slideshow:");
  pinned.forEach(n => console.log(`- ${n.title}: ${n.featuredImage}`));

  await mongoose.disconnect();
}

update();
