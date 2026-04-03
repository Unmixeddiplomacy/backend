/* eslint-disable no-console */

export class Logger {
  static info(message: string, meta?: unknown): void {
    if (meta) {
      console.log(`[INFO] ${message}`, meta);
      return;
    }
    console.log(`[INFO] ${message}`);
  }

  static error(message: string, meta?: unknown): void {
    if (meta) {
      console.error(`[ERROR] ${message}`, meta);
      return;
    }
    console.error(`[ERROR] ${message}`);
  }
}
