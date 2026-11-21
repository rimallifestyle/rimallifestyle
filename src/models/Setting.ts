import mongoose, { Schema, Document } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: any;
}

const SettingSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    type: {
      type: String,
      sparse: true,
    },
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);
