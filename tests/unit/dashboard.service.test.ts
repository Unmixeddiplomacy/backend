import { DashboardService } from "../../src/modules/dashboard/DashboardService";
import { FinancialRecordRepository } from "../../src/modules/financial/FinancialRecordRepository";
import { UserRole } from "../../src/types/enums";

describe("DashboardService", () => {
  it("returns summary from repository", async () => {
    const repository: jest.Mocked<FinancialRecordRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
      summary: jest.fn().mockResolvedValue({
        totalIncome: 1000,
        totalExpense: 400,
        netBalance: 600
      }),
      categoryTotals: jest.fn(),
      monthlyTrends: jest.fn(),
      recentActivity: jest.fn()
    } as unknown as jest.Mocked<FinancialRecordRepository>;

    const service = new DashboardService(repository);

    const result = await service.getSummary(
      {},
      {
        id: "69d013db6e5ef5ecb0955640",
        email: "analyst@test.com",
        name: "Analyst",
        role: UserRole.ANALYST,
        status: "active"
      }
    );

    expect(result).toEqual({ totalIncome: 1000, totalExpense: 400, netBalance: 600 });
    expect(repository.summary).toHaveBeenCalledWith({ userId: "69d013db6e5ef5ecb0955640" });
  });
});
