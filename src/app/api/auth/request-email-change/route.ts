import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import nodemailer from "nodemailer";
import { getEmailChangeOTPTemplate } from "@/lib/email-templates/emailChangeTemplate";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { newEmail } = await req.json();

    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      return NextResponse.json({ success: false, message: "Valid new email is required." }, { status: 400 });
    }

    if (newEmail.toLowerCase() === session.user.email.toLowerCase()) {
      return NextResponse.json({ success: false, message: "This is already your current email." }, { status: 400 });
    }

    await connectToDatabase();
    
    // Check if new email is already taken
    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "This email is already in use by another account." }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.newEmail = newEmail.toLowerCase();
    user.emailChangeOTP = otp;
    user.emailChangeOTPExpires = expires;
    await user.save();

    // Send OTP to the NEW email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = getEmailChangeOTPTemplate(otp, user.name || "Customer");

    await transporter.sendMail({
      from: `"Rimal Store" <${process.env.EMAIL_USER}>`,
      to: newEmail,
      subject: "Verify Your New Email Address",
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your new email.",
    });
  } catch (error: any) {
    console.error("Request Email Change Error:", error);
    return NextResponse.json({ success: false, message: "Failed to request email change. Please try again." }, { status: 500 });
  }
}
