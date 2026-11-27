import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectToDatabase from "@/lib/mongodb";
import OTP from "@/models/OTP";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Invalid email provided" }, { status: 400 });
    }

    await connectToDatabase();

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this email to avoid confusion
    await OTP.deleteMany({ email });

    // Save the new OTP
    await OTP.create({
      email,
      otp,
    });

    // Import the Setting model dynamically or at the top
    const Setting = (await import("@/models/Setting")).default;
    
    // Fetch SMTP settings from DB
    const smtpSetting = await Setting.findOne({ key: "smtp_settings" });
    const smtp = smtpSetting?.value;

    if (!smtp || !smtp.host || !smtp.user || !smtp.pass) {
      console.error("SMTP settings missing in database");
      return NextResponse.json(
        { message: "Server email configuration is missing. Please contact support." },
        { status: 500 }
      );
    }

    // Configure Nodemailer with SMTP credentials from the database
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: parseInt(smtp.port || "465"),
      secure: smtp.port === "465",
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });

    // Import template
    const { getOTPEmailTemplate } = await import("@/lib/email-templates/otpTemplate");

    const mailOptions = {
      from: `"${smtp.fromName || "Rimal Store"}" <${smtp.fromEmail || smtp.user}>`,
      to: email,
      subject: "Verify Your Email - Rimal Store",
      html: getOTPEmailTemplate(otp),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Send OTP Error:", error);
    return NextResponse.json(
      { message: "Failed to send OTP. Please check email configuration." },
      { status: 500 }
    );
  }
}
