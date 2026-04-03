import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { FinancialRecordType } from "../../types/enums";
import { FinancialRecordService } from "./FinancialRecordService";

export class FinancialRecordController {
  constructor(private readonly financialService: FinancialRecordService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const record = await this.financialService.create(req.body, req.user!, req.requestId);

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: record
    });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const filters = {
      userId: req.query.userId ? String(req.query.userId) : undefined,
      fromDate: req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined,
      toDate: req.query.toDate ? new Date(String(req.query.toDate)) : undefined,
      category: req.query.category ? String(req.query.category) : undefined,
      type: req.query.type ? (String(req.query.type) as FinancialRecordType) : undefined,
      minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined
    };

    const options = {
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      sortBy: String(req.query.sortBy) as "date" | "amount" | "createdAt",
      sortOrder: String(req.query.sortOrder) as "asc" | "desc"
    };

    const result = await this.financialService.list(filters, options, req.user!);

    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  };

  listByUserId = async (req: Request, res: Response): Promise<void> => {
    const filters = {
      fromDate: req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined,
      toDate: req.query.toDate ? new Date(String(req.query.toDate)) : undefined,
      category: req.query.category ? String(req.query.category) : undefined,
      type: req.query.type ? (String(req.query.type) as FinancialRecordType) : undefined,
      minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined
    };

    const options = {
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      sortBy: String(req.query.sortBy) as "date" | "amount" | "createdAt",
      sortOrder: String(req.query.sortOrder) as "asc" | "desc"
    };

    const result = await this.financialService.list(
      { ...filters, userId: String(req.params.userId) },
      options,
      req.user!
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const record = await this.financialService.getById(String(req.params.id));
    res.status(StatusCodes.OK).json({
      success: true,
      data: record
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const updated = await this.financialService.update(
      String(req.params.id),
      req.body,
      req.user!,
      req.requestId
    );
    res.status(StatusCodes.OK).json({
      success: true,
      data: updated
    });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.financialService.remove(String(req.params.id), req.user!, req.requestId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Financial record deleted"
    });
  };
}
