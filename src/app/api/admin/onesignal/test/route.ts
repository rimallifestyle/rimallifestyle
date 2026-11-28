import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return false;
  await connectToDatabase();
  const cleanEmail = session.user.email.trim();
  const user = await User.findOne({
    email: { $regex: new RegExp(`^${cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, "i") }
  });
  return user?.role?.toLowerCase() === "admin";
}

export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    const { appId, apiKey } = await req.json();

    if (!appId || !String(appId).trim()) {
      return NextResponse.json({ message: "App ID is required" }, { status: 400 });
    }

    if (!apiKey || !String(apiKey).trim()) {
      return NextResponse.json({ message: "REST API Key is required for testing connection." }, { status: 400 });
    }

    // Call OneSignal API to verify app credentials
    const cleanAppId = String(appId).trim();
    const cleanApiKey = String(apiKey).trim();

    const response = await fetch(`https://onesignal.com/api/v1/apps/${cleanAppId}`, {
      headers: {
        "Authorization": `Basic ${cleanApiKey}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = Array.isArray(data.errors) 
        ? data.errors.join(", ") 
        : (data.errors || data.message || "Failed to verify credentials with OneSignal");
      return NextResponse.json({ message: errMsg }, { status: 400 });
    }

    return NextResponse.json({
      message: `Successfully connected to OneSignal app "${data.name || cleanAppId}"!`,
      appName: data.name,
      subscribers: data.players || 0
    });
  } catch (error: any) {
    console.error("Test OneSignal Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to test OneSignal connection" },
      { status: 500 }
    );
  }
}
