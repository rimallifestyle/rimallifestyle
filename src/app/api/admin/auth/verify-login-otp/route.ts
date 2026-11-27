import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import OTP from "@/models/OTP";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP code are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();

    // Find valid OTP
    const validOTP = await OTP.findOne({
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, "i") },
      otp: cleanOtp,
      type: "admin_login",
    });

    if (!validOTP) {
      return NextResponse.json(
        { message: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    // Delete used OTP
    await OTP.deleteMany({
      email: validOTP.email,
      type: "admin_login",
    });

    return NextResponse.json({
      success: true,
      message: "Security code verified successfully",
    });
  } catch (error: any) {
    console.error("Admin Verify Login OTP Error:", error);
    return NextResponse.json(
      { message: "Failed to verify code" },
      { status: 500 }
    );
  }
}
