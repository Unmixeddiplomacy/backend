import { Types } from "mongoose";
import { Database } from "../config/database";
import { Logger } from "../common/utils/logger";
import { PasswordUtil } from "../common/utils/password";
import { FinancialRecordModel } from "../modules/financial/FinancialRecordModel";
import { UserModel } from "../modules/users/UserModel";
import { FinancialRecordType, UserRole, UserStatus } from "../types/enums";

const defaultUsers = [
  {
    name: "System Admin",
    email: "admin@zorvyn.local",
    password: "Admin@12345",
    role: UserRole.ADMIN
  },
  {
    name: "Finance Analyst",
    email: "analyst@zorvyn.local",
    password: "Analyst@12345",
    role: UserRole.ANALYST
  },
  {
    name: "Finance Viewer",
    email: "viewer@zorvyn.local",
    password: "Viewer@12345",
    role: UserRole.VIEWER
  }
];

const runSeed = async (): Promise<void> => {
  await Database.connect();

  const userIdsByRole = new Map<UserRole, string>();

  for (const entry of defaultUsers) {
    const existing = await UserModel.findOne({ email: entry.email });
    if (existing) {
      userIdsByRole.set(entry.role, existing._id.toString());
      continue;
    }

    const passwordHash = await PasswordUtil.hash(entry.password);
    const created = await UserModel.create({
      name: entry.name,
      email: entry.email,
      passwordHash,
      role: entry.role,
      status: UserStatus.ACTIVE
    });
    userIdsByRole.set(entry.role, created._id.toString());
  }

  const existingRecords = await FinancialRecordModel.countDocuments();
  if (existingRecords === 0) {
    const analystId = userIdsByRole.get(UserRole.ANALYST) ?? userIdsByRole.get(UserRole.ADMIN)!;
    const analystObjectId = new Types.ObjectId(analystId);

    await FinancialRecordModel.insertMany([
      {
        amount: 5000,
        type: FinancialRecordType.INCOME,
        category: "Salary",
        date: new Date("2026-03-01"),
        notes: "Monthly salary",
        createdBy: analystObjectId,
        updatedBy: analystObjectId
      },
      {
        amount: 1400,
        type: FinancialRecordType.EXPENSE,
        category: "Rent",
        date: new Date("2026-03-05"),
        notes: "Office rent",
        createdBy: analystObjectId,
        updatedBy: analystObjectId
      },
      {
        amount: 700,
        type: FinancialRecordType.EXPENSE,
        category: "Software",
        date: new Date("2026-03-10"),
        notes: "Tools subscription",
        createdBy: analystObjectId,
        updatedBy: analystObjectId
      },
      {
        amount: 1200,
        type: FinancialRecordType.INCOME,
        category: "Consulting",
        date: new Date("2026-03-14"),
        notes: "Consulting income",
        createdBy: analystObjectId,
        updatedBy: analystObjectId
      }
    ]);
  }

  Logger.info("Seeding complete");
  Logger.info("Default users:");
  Logger.info("admin@zorvyn.local / Admin@12345");
  Logger.info("analyst@zorvyn.local / Analyst@12345");
  Logger.info("viewer@zorvyn.local / Viewer@12345");

  await Database.disconnect();
};

runSeed().catch(async (error) => {
  Logger.error("Seeding failed", error);
  await Database.disconnect();
  process.exit(1);
});
