import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { getWelcomeEmailTemplate } from "@/lib/email-templates/welcomeTemplate";

export async function POST(req: Request) {
  try {
    const { name, email, password, otp } = await req.json();

    if (!name || !email || !password || !otp) {
      return NextResponse.json(
        { message: "Please fill all fields including OTP" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify OTP
    const validOTP = await OTP.findOne({ email, otp });
    if (!validOTP) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Check if user already exists (as a safety check, though we checked in send-otp)
    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Delete the OTP as it's been used
    await OTP.deleteMany({ email });

    if (user) {
      // --- Send Welcome Email ---
      try {
        const Setting = (await import("@/models/Setting")).default;
        const nodemailer = (await import("nodemailer")).default;
        
        const smtpSetting = await Setting.findOne({ key: "smtp_settings" });
        const smtp = smtpSetting?.value;

        if (smtp && smtp.host && smtp.user && smtp.pass) {
          const transporter = nodemailer.createTransport({
            host: smtp.host,
            port: parseInt(smtp.port || "465"),
            secure: smtp.port === "465",
            auth: {
              user: smtp.user,
              pass: smtp.pass,
            },
          });

          const mailOptions = {
            from: `"${smtp.fromName || "Rimal Store"}" <${smtp.fromEmail || smtp.user}>`,
            to: email,
            subject: "Welcome to Rimal Store!",
            html: getWelcomeEmailTemplate(name),
          };

          await transporter.sendMail(mailOptions);
        }
      } catch (emailError) {
        console.error("Welcome email failed to send:", emailError);
        // Continue anyway since the account is created
      }
      // ----------------------------

      return NextResponse.json(
        {
          _id: user.id,
          name: user.name,
          email: user.email,
          token: "jwt-token-could-go-here", // NextAuth will handle the real token
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { message: "Invalid user data received" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Server error during registration" },
      { status: 500 }
    );
  }
}
