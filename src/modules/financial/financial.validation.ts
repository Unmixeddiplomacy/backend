import { z } from "zod";
import { FinancialRecordType } from "../../types/enums";
import { dateInputSchema } from "../../common/utils/dateInput";

export const createFinancialBodySchema = z.object({
  amount: z.number().positive(),
  type: z.nativeEnum(FinancialRecordType),
  category: z.string().min(1).max(100),
  date: dateInputSchema,
  notes: z.string().max(1000).optional()
});

export const updateFinancialBodySchema = z
  .object({
    amount: z.number().positive().optional(),
    type: z.nativeEnum(FinancialRecordType).optional(),
    category: z.string().min(1).max(100).optional(),
    date: dateInputSchema.optional(),
    notes: z.string().max(1000).optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field is required"
  });

export const financialIdParamSchema = z.object({
  id: z.string().min(24).max(24)
});

export const financialUserIdParamSchema = z.object({
  userId: z.string().min(24).max(24)
});

export const financialQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().min(24).max(24).optional(),
  fromDate: dateInputSchema.optional(),
  toDate: dateInputSchema.optional(),
  type: z.nativeEnum(FinancialRecordType).optional(),
  category: z.string().optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
  sortBy: z.enum(["date", "amount", "createdAt"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});
