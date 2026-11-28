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

export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    await connectToDatabase();

    const body = await req.json();
    const { title, message, url, imageUrl } = body;

    if (!title || !String(title).trim()) {
      return NextResponse.json({ message: "Notification title is required." }, { status: 400 });
    }

    if (!message || !String(message).trim()) {
      return NextResponse.json({ message: "Notification message is required." }, { status: 400 });
    }

    // Load active OneSignal settings from database
    const setting = await Setting.findOne({ key: "onesignal_settings" });
    const config = setting?.value;

    const appId = body.appId || config?.appId;
    const apiKey = body.apiKey || config?.apiKey;

    if (!appId || !apiKey) {
      return NextResponse.json({ 
        message: "OneSignal is not configured yet. Please enter App ID and REST API Key." 
      }, { status: 400 });
    }

    // Build payload for OneSignal REST API
    const payload: any = {
      app_id: String(appId).trim(),
      included_segments: ["Subscribed Users"],
      headings: { en: String(title).trim() },
      contents: { en: String(message).trim() },
    };

    if (url && String(url).trim()) {
      payload.url = String(url).trim();
    }

    if (imageUrl && String(imageUrl).trim()) {
      payload.big_picture = String(imageUrl).trim();
      payload.chrome_web_image = String(imageUrl).trim();
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${String(apiKey).trim()}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = Array.isArray(data.errors) 
        ? data.errors.join(", ") 
        : (data.errors || data.message || "Failed to send notification through OneSignal");
      return NextResponse.json({ message: errMsg }, { status: 400 });
    }

    return NextResponse.json({
      message: "Push notification broadcast sent successfully!",
      id: data.id,
      recipients: data.recipients || 0
    });
  } catch (error: any) {
    console.error("OneSignal Send Broadcast Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to send push notification" },
      { status: 500 }
    );
  }
}
