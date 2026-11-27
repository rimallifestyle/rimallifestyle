import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { message: "Email, reset code, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();

    // Verify OTP
    const validOTP = await OTP.findOne({
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, "i") },
      otp: cleanOtp,
      type: "password_reset",
    });

    if (!validOTP) {
      return NextResponse.json(
        { message: "Invalid or expired reset code. Please request a new code." },
        { status: 400 }
      );
    }

    // Find User
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, "i") },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Delete used OTP
    await OTP.deleteMany({
      email: validOTP.email,
      type: "password_reset",
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now sign in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
