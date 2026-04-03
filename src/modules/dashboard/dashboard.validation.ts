import { z } from "zod";
import { FinancialRecordType } from "../../types/enums";
import { dateInputSchema } from "../../common/utils/dateInput";

export const dashboardFilterQuerySchema = z.object({
  userId: z.string().min(24).max(24).optional(),
  fromDate: dateInputSchema.optional(),
  toDate: dateInputSchema.optional(),
  type: z.nativeEnum(FinancialRecordType).optional(),
  category: z.string().optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});
