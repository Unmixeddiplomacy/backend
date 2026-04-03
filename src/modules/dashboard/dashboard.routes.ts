import { Router } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { validate } from "../../common/middleware/validate";
import { UserRole } from "../../types/enums";
import { FinancialRecordRepository } from "../financial/FinancialRecordRepository";
import { DashboardService } from "./DashboardService";
import { DashboardController } from "./DashboardController";
import { dashboardFilterQuerySchema } from "./dashboard.validation";

const financialRepository = new FinancialRecordRepository();
const dashboardService = new DashboardService(financialRepository);
const dashboardController = new DashboardController(dashboardService);

export const dashboardRouter = Router();

dashboardRouter.use(authenticate, authorize(UserRole.VIEWER, UserRole.ANALYST, UserRole.ADMIN));

dashboardRouter.get("/summary", validate({ query: dashboardFilterQuerySchema }), asyncHandler(dashboardController.summary));
dashboardRouter.get(
  "/category-totals",
  validate({ query: dashboardFilterQuerySchema }),
  asyncHandler(dashboardController.categoryTotals)
);
dashboardRouter.get("/trends", validate({ query: dashboardFilterQuerySchema }), asyncHandler(dashboardController.trends));
dashboardRouter.get(
  "/recent-activity",
  validate({ query: dashboardFilterQuerySchema }),
  asyncHandler(dashboardController.recentActivity)
);
