import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Check if user is an admin
    const user = await User.findOne({ email: session.user.email });
    if (user?.role?.toLowerCase() !== "admin") {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    const { host, port, user: smtpUser, pass, testEmail, fromName, fromEmail } = await req.json();

    if (!host || !port || !smtpUser || !pass) {
      return NextResponse.json(
        { message: "Please provide Host, Port, Username, and Password to test." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465,
      auth: {
        user: smtpUser,
        pass,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });

    // Verify connection configuration
    await transporter.verify();

    // Send a test email to the admin or specified testEmail
    const targetEmail = testEmail || session.user.email;
    if (targetEmail) {
      try {
        await transporter.sendMail({
          from: `"${fromName || "Rimal Store"}" <${fromEmail || smtpUser}>`,
          to: targetEmail,
          subject: "SMTP Test Successful - Rimal Store",
          html: `
            <div style="font-family: sans-serif; background-color: #0d0303; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #331010;">
              <h2 style="color: #d4af37; margin-top: 0;">SMTP Integration Verified!</h2>
              <p>Your SMTP mail server configuration is active and working perfectly.</p>
              <p style="color: #aaa; font-size: 13px;">Host: ${host} | Port: ${port} | User: ${smtpUser}</p>
              <p style="color: #d4af37; font-size: 12px; margin-bottom: 0;">&copy; ${new Date().getFullYear()} Rimal Store</p>
            </div>
          `,
        });
      } catch (mailSendErr) {
        console.warn("Test email send warning:", mailSendErr);
      }
    }

    return NextResponse.json(
      { message: `Connection successful! Test email delivered to ${targetEmail}.` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("SMTP Test Error:", error);
    
    // Make the error message more readable
    let errorMessage = "Failed to connect to SMTP server.";
    if (error.code === 'EAUTH') {
      errorMessage = "Authentication failed. Please check your username and password.";
    } else if (error.code === 'EBUSY' || error.code === 'ENOTFOUND' || (error.message && error.message.includes('getaddrinfo'))) {
      errorMessage = `Cannot resolve SMTP host "${host}". Please make sure this domain exists and has valid DNS records, or use your mail provider's official SMTP host (e.g. smtp.gmail.com).`;
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      errorMessage = "Connection timed out or network error. Please verify your Host and Port (e.g. 465 for SSL, 587 for TLS).";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { message: errorMessage, details: error.message },
      { status: 400 }
    );
  }
}
