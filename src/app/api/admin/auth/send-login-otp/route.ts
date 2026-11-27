import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { getSMTPSettings, sendMail, getAdminLoginOTPEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const cleanEmail = email.trim();
    const escapedEmail = cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${escapedEmail}$`, "i") },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const role = (user.role || "").toLowerCase();
    if (role !== "admin") {
      return NextResponse.json(
        { message: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    // Check if SMTP is configured
    const smtp = await getSMTPSettings();

    // If SMTP is not configured or 2FA is explicitly disabled, allow direct login
    if (!smtp || smtp.admin2FA === false) {
      return NextResponse.json({
        success: true,
        bypass2FA: true,
        message: "SMTP not configured or 2FA disabled. Logging in directly.",
      });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete existing admin login OTPs for this email
    await OTP.deleteMany({ email: user.email, type: "admin_login" });

    // Save OTP (10 minute expiry)
    await OTP.create({
      email: user.email,
      otp,
      type: "admin_login",
    });

    // Send OTP email
    await sendMail({
      to: user.email,
      subject: `Your Admin Login Code: ${otp} - Rimal Store`,
      html: getAdminLoginOTPEmail(otp, user.name),
      text: `Your Rimal Store Admin Login Code is ${otp}. Valid for 10 minutes.`,
    });

    // Mask email for security display e.g. ad***@gmail.com
    const parts = user.email.split("@");
    const maskedName = parts[0].length > 2 
      ? parts[0].substring(0, 2) + "***" 
      : parts[0] + "***";
    const maskedEmail = `${maskedName}@${parts[1]}`;

    return NextResponse.json({
      success: true,
      requires2FA: true,
      maskedEmail,
      message: "Security code sent to your email",
    });
  } catch (error: any) {
    console.error("Admin Send Login OTP Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to initiate login verification" },
      { status: 500 }
    );
  }
}
