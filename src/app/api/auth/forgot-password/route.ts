import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { getSMTPSettings, sendMail, getPasswordResetOTPEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "A valid email address is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const cleanEmail = email.trim();
    const escapedEmail = cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${escapedEmail}$`, "i") },
    });

    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email address." },
        { status: 404 }
      );
    }

    // Check if SMTP is configured
    const smtp = await getSMTPSettings();
    if (!smtp) {
      return NextResponse.json(
        { message: "Email service (SMTP) is not configured yet. Please contact support or the administrator." },
        { status: 500 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete existing reset OTPs for this email
    await OTP.deleteMany({ email: user.email, type: "password_reset" });

    // Save OTP (10 minute expiry)
    await OTP.create({
      email: user.email,
      otp,
      type: "password_reset",
    });

    // Send reset OTP email
    await sendMail({
      to: user.email,
      subject: `Password Reset Code: ${otp} - Rimal Store`,
      html: getPasswordResetOTPEmail(otp, user.name),
      text: `Your Rimal Store password reset code is ${otp}. Valid for 10 minutes.`,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset code sent to your email",
    });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
