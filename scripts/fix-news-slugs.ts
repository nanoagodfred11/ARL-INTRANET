import mongoose from "mongoose";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fixSlugs() {
  await mongoose.connect("mongodb://localhost:27017/arl_intranet");

  const news = await mongoose.connection.db.collection("news").find({}).toArray();

  for (const article of news) {
    const newSlug = generateSlug(article.title);
    await mongoose.connection.db.collection("news").updateOne(
      { _id: article._id },
      { $set: { slug: newSlug } }
    );
    console.log(`Updated: "${article.title}" -> ${newSlug}`);
  }

  console.log("\nAll slugs updated!");
  await mongoose.disconnect();
}

fixSlugs();
