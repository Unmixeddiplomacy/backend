import { App } from "../src/app";
import { Database } from "../src/config/database";

const app = new App().instance;

export default async function handler(req: any, res: any): Promise<void> {
  try {
    await Database.connect();
    app(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to initialize server",
      details: process.env.NODE_ENV === "development" ? String(error) : undefined
    });
  }
}
