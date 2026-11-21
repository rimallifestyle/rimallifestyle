import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { otp } = await req.json();

    if (!otp || otp.length !== 6) {
      return NextResponse.json({ success: false, message: "Invalid verification code." }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (!user.emailChangeOTP || !user.newEmail) {
      return NextResponse.json({ success: false, message: "No email change request found." }, { status: 400 });
    }

    if (user.emailChangeOTP !== otp) {
      return NextResponse.json({ success: false, message: "Incorrect verification code." }, { status: 400 });
    }

    if (user.emailChangeOTPExpires && user.emailChangeOTPExpires < new Date()) {
      return NextResponse.json({ success: false, message: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    // Success! Update email
    const oldEmail = user.email;
    user.email = user.newEmail;
    
    // Clear OTP fields
    user.newEmail = undefined;
    user.emailChangeOTP = undefined;
    user.emailChangeOTPExpires = undefined;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Email successfully updated. Please login with your new email next time.",
      user: {
        email: user.email,
        name: user.name,
      }
    });
  } catch (error: any) {
    console.error("Verify Email Change Error:", error);
    return NextResponse.json({ success: false, message: "Failed to verify email change. Please try again." }, { status: 500 });
  }
}
