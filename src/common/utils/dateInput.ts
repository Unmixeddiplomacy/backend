import { z } from "zod";

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

const parseDateInput = (value: string | number): Date | null => {
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const input = value.trim();
  if (!input) {
    return null;
  }

  if (dateOnlyPattern.test(input)) {
    const date = new Date(`${input}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const dateInputSchema = z
  .union([z.date(), z.string(), z.number()])
  .transform((value, context): Date => {
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Invalid date format. Use YYYY-MM-DD, ISO date-time (e.g. 2026-04-04T10:30:00Z), or Unix timestamp in milliseconds."
        });
        return z.NEVER;
      }
      return value;
    }

    const parsed = parseDateInput(value);
    if (!parsed) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Invalid date format. Use YYYY-MM-DD, ISO date-time (e.g. 2026-04-04T10:30:00Z), or Unix timestamp in milliseconds."
      });
      return z.NEVER;
    }

    return parsed;
  });
