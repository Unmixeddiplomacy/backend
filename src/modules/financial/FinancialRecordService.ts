import { ForbiddenError, NotFoundError } from "../../common/errors/HttpErrors";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../types/auth";
import { FinancialRecordType, UserRole } from "../../types/enums";
import { AuditService } from "../audit/AuditService";
import {
  FinancialFilters,
  FinancialRecordRepository,
  PaginationOptions
} from "./FinancialRecordRepository";

export class FinancialRecordService {
  constructor(
    private readonly financialRepository: FinancialRecordRepository,
    private readonly auditService: AuditService
  ) {}

  async create(
    input: {
      amount: number;
      type: FinancialRecordType;
      category: string;
      date: Date;
      notes?: string;
    },
    actor: AuthenticatedUser,
    requestId?: string
  ) {
    const created = await this.financialRepository.create({
      ...input,
      createdBy: actor.id,
      updatedBy: actor.id
    });

    await this.auditService.log({
      action: "CREATE",
      resource: "FinancialRecord",
      resourceId: created._id.toString(),
      actorId: actor.id,
      requestId
    });

    return created;
  }

  async list(filters: FinancialFilters, options: PaginationOptions, actor: AuthenticatedUser) {
    if (actor.role === UserRole.ANALYST) {
      if (filters.userId && filters.userId !== actor.id) {
        throw new ForbiddenError("Analysts can only view their own records");
      }
      return this.financialRepository.list({ ...filters, userId: actor.id }, options);
    }

    return this.financialRepository.list(filters, options);
  }

  async getById(id: string) {
    const record = await this.financialRepository.findById(id);
    if (!record) {
      throw new NotFoundError("Financial record not found");
    }
    return record;
  }

  async update(
    id: string,
    input: {
      amount?: number;
      type?: FinancialRecordType;
      category?: string;
      date?: Date;
      notes?: string;
    },
    actor: AuthenticatedUser,
    requestId?: string
  ) {
    const existing = await this.financialRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Financial record not found");
    }

    if (actor.role === UserRole.ANALYST && existing.createdBy.toString() !== actor.id) {
      throw new ForbiddenError("Analysts can only update their own records");
    }

    const updated = await this.financialRepository.updateById(id, {
      ...input,
      updatedBy: new Types.ObjectId(actor.id)
    });

    if (!updated) {
      throw new NotFoundError("Financial record not found");
    }

    await this.auditService.log({
      action: "UPDATE",
      resource: "FinancialRecord",
      resourceId: updated._id.toString(),
      actorId: actor.id,
      requestId
    });

    return updated;
  }

  async remove(id: string, actor: AuthenticatedUser, requestId?: string) {
    const existing = await this.financialRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Financial record not found");
    }

    const deleted = await this.financialRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError("Financial record not found");
    }

    await this.auditService.log({
      action: "DELETE",
      resource: "FinancialRecord",
      resourceId: deleted._id.toString(),
      actorId: actor.id,
      requestId
    });

    return deleted;
  }
}
