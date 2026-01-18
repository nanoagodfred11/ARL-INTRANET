import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var __mongoConnection: Promise<typeof mongoose> | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/arl_intranet";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.__mongoConnection;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached) {
    return cached;
  }

  cached = mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  global.__mongoConnection = cached;

  try {
    const connection = await cached;
    console.log("MongoDB connected successfully");
    return connection;
  } catch (error) {
    cached = undefined;
    global.__mongoConnection = undefined;
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cached = undefined;
    global.__mongoConnection = undefined;
    console.log("MongoDB disconnected");
  }
}

export function getConnectionStatus(): string {
  const states: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return states[mongoose.connection.readyState] || "unknown";
}

// Alias for convenience
export const connectDB = connectToDatabase;
