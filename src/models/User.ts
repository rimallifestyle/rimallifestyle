import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  apiToken?: string;
  role: string;
  status: string;
  phone?: string;
  address?: string;
  avatar?: string;
  newEmail?: string;
  emailChangeOTP?: string;
  emailChangeOTPExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      // Not required because OAuth users (Google/Facebook) won't have a password
    },
    apiToken: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin", "customer", "shop_manager"],
      default: "customer",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    avatar: {
      type: String,
    },
    newEmail: {
      type: String,
    },
    emailChangeOTP: {
      type: String,
    },
    emailChangeOTPExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
