import { Router } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { validate } from "../../common/middleware/validate";
import { UserRole } from "../../types/enums";
import { AuditService } from "../audit/AuditService";
import { FinancialRecordController } from "./FinancialRecordController";
import { FinancialRecordRepository } from "./FinancialRecordRepository";
import { FinancialRecordService } from "./FinancialRecordService";
import {
  createFinancialBodySchema,
  financialIdParamSchema,
  financialQuerySchema,
  financialUserIdParamSchema,
  updateFinancialBodySchema
} from "./financial.validation";

const financialRepository = new FinancialRecordRepository();
const auditService = new AuditService();
const financialService = new FinancialRecordService(financialRepository, auditService);
const financialController = new FinancialRecordController(financialService);

export const financialRouter = Router();

financialRouter.use(authenticate);

financialRouter.get(
  "/",
  authorize(UserRole.ANALYST, UserRole.ADMIN),
  validate({ query: financialQuerySchema }),
  asyncHandler(financialController.list)
);
financialRouter.get(
  "/user/:userId",
  authorize(UserRole.ANALYST, UserRole.ADMIN),
  validate({ params: financialUserIdParamSchema, query: financialQuerySchema }),
  asyncHandler(financialController.listByUserId)
);
financialRouter.get(
  "/:id",
  authorize(UserRole.ANALYST, UserRole.ADMIN),
  validate({ params: financialIdParamSchema }),
  asyncHandler(financialController.getById)
);
financialRouter.post(
  "/",
  authorize(UserRole.ANALYST, UserRole.ADMIN),
  validate({ body: createFinancialBodySchema }),
  asyncHandler(financialController.create)
);
financialRouter.patch(
  "/:id",
  authorize(UserRole.ANALYST, UserRole.ADMIN),
  validate({ params: financialIdParamSchema, body: updateFinancialBodySchema }),
  asyncHandler(financialController.update)
);
financialRouter.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  validate({ params: financialIdParamSchema }),
  asyncHandler(financialController.remove)
);
