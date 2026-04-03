import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { FinancialRecordType } from "../../types/enums";
import { FinancialFilters } from "../financial/FinancialRecordRepository";
import { DashboardService } from "./DashboardService";

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  private extractFilters(query: Request["query"]): FinancialFilters {
    return {
      userId: query.userId ? String(query.userId) : undefined,
      fromDate: query.fromDate ? new Date(String(query.fromDate)) : undefined,
      toDate: query.toDate ? new Date(String(query.toDate)) : undefined,
      category: query.category ? String(query.category) : undefined,
      type: query.type ? (String(query.type) as FinancialRecordType) : undefined,
      minAmount: query.minAmount ? Number(query.minAmount) : undefined,
      maxAmount: query.maxAmount ? Number(query.maxAmount) : undefined
    };
  }

  summary = async (req: Request, res: Response): Promise<void> => {
    const data = await this.dashboardService.getSummary(this.extractFilters(req.query), req.user!);
    res.status(StatusCodes.OK).json({ success: true, data });
  };

  categoryTotals = async (req: Request, res: Response): Promise<void> => {
    const data = await this.dashboardService.getCategoryTotals(this.extractFilters(req.query), req.user!);
    res.status(StatusCodes.OK).json({ success: true, data });
  };

  trends = async (req: Request, res: Response): Promise<void> => {
    const data = await this.dashboardService.getTrends(this.extractFilters(req.query), req.user!);
    res.status(StatusCodes.OK).json({ success: true, data });
  };

  recentActivity = async (req: Request, res: Response): Promise<void> => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const data = await this.dashboardService.getRecentActivity(limit, this.extractFilters(req.query), req.user!);
    res.status(StatusCodes.OK).json({ success: true, data });
  };
}
