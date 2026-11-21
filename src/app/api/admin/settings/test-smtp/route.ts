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

    const { host, port, user: smtpUser, pass } = await req.json();

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
    });

    // Verify connection configuration
    await transporter.verify();

    return NextResponse.json(
      { message: "Connection successful! Your SMTP settings are correct." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("SMTP Test Error:", error);
    
    // Make the error message more readable
    let errorMessage = "Failed to connect to SMTP server.";
    if (error.code === 'EAUTH') {
      errorMessage = "Authentication failed. Please check your username and password.";
    } else if (error.code === 'ESOCKET') {
      errorMessage = "Network error. Please check your Host and Port (try 465 or 587).";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { message: errorMessage, details: error.message },
      { status: 400 }
    );
  }
}
