import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";
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

export async function GET() {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    await connectToDatabase();
    const setting = await Setting.findOne({ key: "onesignal_settings" });

    return NextResponse.json(
      { data: setting?.value || null },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fetch OneSignal Settings Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch OneSignal settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    // Body can be null to disconnect/clear
    if (!body || body.disconnect) {
      await Setting.findOneAndUpdate(
        { key: "onesignal_settings" },
        { key: "onesignal_settings", value: null },
        { upsert: true }
      );
      return NextResponse.json({ message: "OneSignal disconnected successfully" });
    }

    const { appId, apiKey, safariWebId, autoPrompt, enabled, welcomeNotification } = body;

    if (!appId || !String(appId).trim()) {
      return NextResponse.json({ message: "OneSignal App ID is required." }, { status: 400 });
    }

    const sanitizedSettings = {
      enabled: Boolean(enabled),
      appId: String(appId).trim(),
      apiKey: apiKey ? String(apiKey).trim() : "",
      safariWebId: safariWebId ? String(safariWebId).trim() : "",
      autoPrompt: autoPrompt !== false,
      welcomeNotification: welcomeNotification !== false,
      updatedAt: new Date().toISOString()
    };

    await Setting.findOneAndUpdate(
      { key: "onesignal_settings" },
      { key: "onesignal_settings", value: sanitizedSettings },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: "OneSignal settings saved successfully!",
      data: sanitizedSettings
    });
  } catch (error: any) {
    console.error("Save OneSignal Settings Error:", error);
    return NextResponse.json(
      { message: "Failed to save OneSignal settings" },
      { status: 500 }
    );
  }
}
