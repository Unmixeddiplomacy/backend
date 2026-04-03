import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server-core";

let mongoServer: MongoMemoryServer;

export const connectTestDatabase = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: "7.0.14"
    }
  });
  await mongoose.connect(mongoServer.getUri());
};

export const clearTestDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
};

export const closeTestDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};
