import { Types } from "mongoose";
import { FinancialRecordType } from "../../types/enums";
import { FinancialRecordModel, IFinancialRecord } from "./FinancialRecordModel";

export interface FinancialFilters {
  userId?: string;
  fromDate?: Date;
  toDate?: Date;
  category?: string;
  type?: FinancialRecordType;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: "date" | "amount" | "createdAt";
  sortOrder: "asc" | "desc";
}

export class FinancialRecordRepository {
  private buildFilterQuery(filters: FinancialFilters): Record<string, any> {
    const query: Record<string, any> = {};

    if (filters.userId) {
      query.createdBy = new Types.ObjectId(filters.userId);
    }

    if (filters.fromDate || filters.toDate) {
      query.date = {};
      if (filters.fromDate) {
        query.date.$gte = filters.fromDate;
      }
      if (filters.toDate) {
        query.date.$lte = filters.toDate;
      }
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      query.amount = {};
      if (filters.minAmount !== undefined) {
        query.amount.$gte = filters.minAmount;
      }
      if (filters.maxAmount !== undefined) {
        query.amount.$lte = filters.maxAmount;
      }
    }

    return query;
  }

  async create(input: {
    amount: number;
    type: FinancialRecordType;
    category: string;
    date: Date;
    notes?: string;
    createdBy: string;
    updatedBy: string;
  }): Promise<IFinancialRecord> {
    return FinancialRecordModel.create({
      ...input,
      createdBy: new Types.ObjectId(input.createdBy),
      updatedBy: new Types.ObjectId(input.updatedBy)
    });
  }

  async findById(id: string): Promise<IFinancialRecord | null> {
    return FinancialRecordModel.findById(id);
  }

  async list(filters: FinancialFilters, options: PaginationOptions) {
    const query = this.buildFilterQuery(filters);
    const skip = (options.page - 1) * options.limit;
    const sortDirection = options.sortOrder === "asc" ? 1 : -1;

    const [records, total] = await Promise.all([
      FinancialRecordModel.find(query)
        .sort({ [options.sortBy]: sortDirection })
        .skip(skip)
        .limit(options.limit),
      FinancialRecordModel.countDocuments(query)
    ]);

    return {
      records,
      total,
      page: options.page,
      limit: options.limit
    };
  }

  async updateById(id: string, update: Partial<IFinancialRecord>): Promise<IFinancialRecord | null> {
    return FinancialRecordModel.findByIdAndUpdate(id, update, { new: true });
  }

  async deleteById(id: string): Promise<IFinancialRecord | null> {
    return FinancialRecordModel.findByIdAndDelete(id);
  }

  async summary(filters: FinancialFilters): Promise<{ totalIncome: number; totalExpense: number; netBalance: number }> {
    const query = this.buildFilterQuery(filters);
    const result = await FinancialRecordModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    const incomeItem = result.find((item) => item._id === FinancialRecordType.INCOME);
    const expenseItem = result.find((item) => item._id === FinancialRecordType.EXPENSE);

    const totalIncome = incomeItem?.total ?? 0;
    const totalExpense = expenseItem?.total ?? 0;

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense
    };
  }

  async categoryTotals(filters: FinancialFilters): Promise<Array<{ category: string; total: number }>> {
    const query = this.buildFilterQuery(filters);
    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      },
      { $sort: { total: -1 } }
    ];

    const result = await FinancialRecordModel.aggregate(pipeline as any[]);
    return result.map((item) => ({ category: item._id as string, total: item.total as number }));
  }

  async monthlyTrends(filters: FinancialFilters): Promise<Array<{ month: string; income: number; expense: number }>> {
    const query = this.buildFilterQuery(filters);
    const result = await FinancialRecordModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$date" } },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $group: {
          _id: "$_id.month",
          entries: {
            $push: {
              type: "$_id.type",
              total: "$total"
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return result.map((monthItem) => {
      const income = monthItem.entries.find((entry: { type: FinancialRecordType; total: number }) => entry.type === FinancialRecordType.INCOME)?.total ?? 0;
      const expense = monthItem.entries.find((entry: { type: FinancialRecordType; total: number }) => entry.type === FinancialRecordType.EXPENSE)?.total ?? 0;
      return {
        month: monthItem._id as string,
        income,
        expense
      };
    });
  }

  async recentActivity(limit: number, filters: FinancialFilters = {}): Promise<IFinancialRecord[]> {
    const query = this.buildFilterQuery(filters);
    return FinancialRecordModel.find(query).sort({ createdAt: -1 }).limit(limit);
  }
}
