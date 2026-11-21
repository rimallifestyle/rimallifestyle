import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: "marquee" });

    if (!setting) {
      return NextResponse.json({
        enabled: true,
        items: [
          "FREE SHIPPING ON ORDERS OVER ৳5,000",
          "NEW SUMMER COLLECTION ARRIVED",
          "10% OFF ON YOUR FIRST ORDER"
        ]
      });
    }

    return NextResponse.json(setting.value);
  } catch (error: any) {
    console.error("GET Marquee Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const value = await req.json();

    await connectToDatabase();
    
    await Setting.findOneAndUpdate(
      { key: "marquee" },
      { key: "marquee", value },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, value });
  } catch (error: any) {
    console.error("PUT Marquee Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
