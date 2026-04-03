import { App } from "../src/app";
import { Database } from "../src/config/database";
import { Express } from "express";

let appInstance: Express | null = null;

const resolveInitErrorCode = (error: unknown): string => {
  const message = String(error);

  if (message.includes("ZodError") || message.includes("Invalid environment")) {
    return "CONFIG_ERROR";
  }

  if (message.toLowerCase().includes("authentication failed") || message.toLowerCase().includes("bad auth")) {
    return "DB_AUTH_ERROR";
  }

  if (message.includes("ENOTFOUND") || message.includes("querySrv")) {
    return "DB_DNS_ERROR";
  }

  if (message.toLowerCase().includes("timed out") || message.toLowerCase().includes("server selection")) {
    return "DB_TIMEOUT";
  }

  return "INIT_ERROR";
};

const getApp = () => {
  if (!appInstance) {
    appInstance = new App().instance;
  }

  return appInstance;
};

export default async function handler(req: any, res: any): Promise<void> {
  try {
    await Database.connect();
    const app = getApp();
    app(req, res);
  } catch (error) {
    const code = resolveInitErrorCode(error);
    console.error("[VercelInitError]", code, error);

    res.status(500).json({
      success: false,
      message: "Failed to initialize server",
      code,
      details: process.env.NODE_ENV === "development" ? String(error) : undefined
    });
  }
}
