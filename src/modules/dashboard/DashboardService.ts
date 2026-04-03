import { ForbiddenError } from "../../common/errors/HttpErrors";
import { AuthenticatedUser } from "../../types/auth";
import { UserRole } from "../../types/enums";
import { FinancialRecordRepository, FinancialFilters } from "../financial/FinancialRecordRepository";

export class DashboardService {
  constructor(private readonly financialRepository: FinancialRecordRepository) {}

  private resolveScopedFilters(filters: FinancialFilters, actor: AuthenticatedUser): FinancialFilters {
    if (actor.role === UserRole.ADMIN) {
      return filters;
    }

    if (filters.userId && filters.userId !== actor.id) {
      throw new ForbiddenError("You can only view your own dashboard data");
    }

    return { ...filters, userId: actor.id };
  }

  async getSummary(filters: FinancialFilters, actor: AuthenticatedUser) {
    return this.financialRepository.summary(this.resolveScopedFilters(filters, actor));
  }

  async getCategoryTotals(filters: FinancialFilters, actor: AuthenticatedUser) {
    return this.financialRepository.categoryTotals(this.resolveScopedFilters(filters, actor));
  }

  async getTrends(filters: FinancialFilters, actor: AuthenticatedUser) {
    return this.financialRepository.monthlyTrends(this.resolveScopedFilters(filters, actor));
  }

  async getRecentActivity(limit: number, filters: FinancialFilters, actor: AuthenticatedUser) {
    return this.financialRepository.recentActivity(limit, this.resolveScopedFilters(filters, actor));
  }
}
