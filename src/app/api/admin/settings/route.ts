import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Optional: Check if user is an admin
    const user = await User.findOne({ email: session.user.email });
    if (user?.role?.toLowerCase() !== "admin") {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    // Get the key from query params
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ message: "Setting key is required" }, { status: 400 });
    }

    const setting = await Setting.findOne({ key });
    
    return NextResponse.json(
      { data: setting?.value || null },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fetch Settings Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

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

    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ message: "Setting key is required" }, { status: 400 });
    }

    // Upsert setting
    await Setting.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Settings saved successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Save Settings Error:", error);
    return NextResponse.json(
      { message: "Failed to save settings" },
      { status: 500 }
    );
  }
}
