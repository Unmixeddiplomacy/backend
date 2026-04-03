import { AuditLogModel } from "./AuditLogModel";

export class AuditService {
  async log(input: {
    action: string;
    resource: string;
    resourceId: string;
    actorId: string;
    requestId?: string;
  }): Promise<void> {
    await AuditLogModel.create(input);
  }
}
