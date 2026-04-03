import { Document, Schema, Types, model } from "mongoose";
import { FinancialRecordType } from "../../types/enums";

export interface IFinancialRecord extends Document {
  amount: number;
  type: FinancialRecordType;
  category: string;
  date: Date;
  notes?: string;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const financialRecordSchema = new Schema<IFinancialRecord>(
  {
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      required: true,
      enum: Object.values(FinancialRecordType),
      index: true
    },
    category: { type: String, required: true, trim: true, index: true },
    date: { type: Date, required: true, index: true },
    notes: { type: String, trim: true, maxlength: 1000 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

financialRecordSchema.index({ date: -1, category: 1, type: 1 });
financialRecordSchema.index({ createdBy: 1, date: -1 });

export const FinancialRecordModel = model<IFinancialRecord>("FinancialRecord", financialRecordSchema);
