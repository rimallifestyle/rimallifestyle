import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
  email: string;
  otp: string;
  type?: string;
  createdAt: Date;
}

const OTPSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "register",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // 10 minutes expiry
    },
  }
);

export default mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);
