/**
 * Script to add company images to news and gallery
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/arl_intranet";

async function addCompanyImages() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected!");

    // 1. Update news articles with real company images
    const newsUpdates = [
      {
        filter: { title: "ARL Achieves One Million Safe Work Hours" },
        update: {
          title: "Women in Mining: Breaking Barriers",
          excerpt: "Celebrating our incredible women who power our mining operations every day. Diversity and inclusion drive our success.",
          featuredImage: "/images/women-in-mining.jpg",
          isPinned: true
        }
      },
      {
        filter: { title: "New Underground Development Project Begins" },
        update: {
          title: "Nguvu Mining Wins Best Mining Company Award",
          excerpt: "We are proud to receive the Best Mining Company Award, recognizing our commitment to excellence, safety, and community development.",
          featuredImage: "/images/award-ceremony.jpg",
          isPinned: true
        }
      },
      {
        filter: { title: "Community Health Screening Program Launched" },
        update: {
          title: "Our First Aid Team: Ready to Respond",
          excerpt: "Meet our dedicated First Aid team, trained and ready to ensure the safety and wellbeing of all personnel on site.",
          featuredImage: "/images/first-aid-team.jpg",
          isPinned: false
        }
      },
      {
        filter: { title: "Environmental Rehabilitation Project Shows Progress" },
        update: {
          title: "Gold Processing: From Ore to Gold",
          excerpt: "A behind-the-scenes look at our gold preparation and processing operations that turn raw ore into refined gold.",
          featuredImage: "/images/gold-prep.jpg",
          isPinned: false
        }
      }
    ];

    for (const { filter, update } of newsUpdates) {
      const result = await mongoose.connection.db.collection("news").updateOne(
        filter,
        { $set: update }
      );
      if (result.modifiedCount > 0) {
        console.log(`Updated news: "${update.title}"`);
      }
    }

    // 2. Update gallery albums with real images
    const albumUpdates = [
      {
        filter: { slug: { $exists: true } },
        update: {
          title: "Team & Community",
          description: "Photos of our amazing team and community initiatives",
          coverImage: "/images/exploration-team.jpg"
        }
      }
    ];

    const albums = await mongoose.connection.db.collection("albums").find({}).toArray();
    if (albums.length > 0) {
      await mongoose.connection.db.collection("albums").updateOne(
        { _id: albums[0]._id },
        {
          $set: {
            title: "Exploration Team",
            description: "Our dedicated exploration team discovering new opportunities",
            coverImage: "/images/exploration-team.jpg"
          }
        }
      );
      console.log("Updated album 1: Exploration Team");

      if (albums.length > 1) {
        await mongoose.connection.db.collection("albums").updateOne(
          { _id: albums[1]._id },
          {
            $set: {
              title: "Team Celebrations",
              description: "Celebrating achievements and milestones together",
              coverImage: "/images/workers-team.jpg"
            }
          }
        );
        console.log("Updated album 2: Team Celebrations");
      }

      if (albums.length > 2) {
        await mongoose.connection.db.collection("albums").updateOne(
          { _id: albums[2]._id },
          {
            $set: {
              title: "Women in Mining",
              description: "Celebrating the women who power our operations",
              coverImage: "/images/women-in-mining.jpg"
            }
          }
        );
        console.log("Updated album 3: Women in Mining");
      }
    }

    // 3. Update events with real images
    const events = await mongoose.connection.db.collection("events").find({}).toArray();
    if (events.length > 0) {
      await mongoose.connection.db.collection("events").updateOne(
        { _id: events[0]._id },
        {
          $set: {
            title: "Annual Awards Ceremony",
            description: "Celebrating excellence and recognizing outstanding contributions",
            featuredImage: "/images/award-ceremony.jpg"
          }
        }
      );
      console.log("Updated event: Annual Awards Ceremony");

      if (events.length > 1) {
        await mongoose.connection.db.collection("events").updateOne(
          { _id: events[1]._id },
          {
            $set: {
              title: "Team Building Day",
              description: "Strengthening bonds and building team spirit",
              featuredImage: "/images/exploration-team.jpg"
            }
          }
        );
        console.log("Updated event: Team Building Day");
      }
    }

    console.log("\nDone! All company images added.");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

addCompanyImages();
