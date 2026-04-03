import { Document, Schema, model } from "mongoose";

export interface IAuditLog extends Document {
  action: string;
  resource: string;
  resourceId: string;
  actorId: string;
  requestId?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String, required: true },
    actorId: { type: String, required: true, index: true },
    requestId: { type: String }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
  }
);

auditLogSchema.index({ createdAt: -1, actorId: 1 });

export const AuditLogModel = model<IAuditLog>("AuditLog", auditLogSchema);
