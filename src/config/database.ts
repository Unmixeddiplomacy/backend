import mongoose from "mongoose";
import { env } from "./env";
import { Logger } from "../common/utils/logger";

export class Database {
  static async connect(): Promise<void> {
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 20
    });
    Logger.info("MongoDB connected");
  }

  static async disconnect(): Promise<void> {
    await mongoose.disconnect();
    Logger.info("MongoDB disconnected");
  }
}
