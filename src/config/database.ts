import mongoose from "mongoose";
import { env } from "./env";
import { Logger } from "../common/utils/logger";

type CachedMongoose = {
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  _mongoose?: CachedMongoose;
};

const cached = globalForMongoose._mongoose ?? { promise: null };
globalForMongoose._mongoose = cached;

export class Database {
  static async connect(): Promise<void> {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    if (!cached.promise) {
      cached.promise = mongoose
        .connect(env.MONGODB_URI, {
          maxPoolSize: 20,
          serverSelectionTimeoutMS: 30000
        })
        .then((connection) => {
          Logger.info("MongoDB connected");
          return connection;
        })
        .catch((error) => {
          cached.promise = null;
          throw error;
        });
    }

    await cached.promise;
  }

  static async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    cached.promise = null;
    Logger.info("MongoDB disconnected");
  }
}
