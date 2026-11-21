import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing section id" }, { status: 400 });
    }

    const key = `section_${id}`;

    await connectToDatabase();
    const setting = await Setting.findOne({ key });

    if (!setting) {
      return NextResponse.json({
        title: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        subtitle: `Discover our collection of ${id.replace(/_/g, ' ')}`,
        productCount: 4,
      });
    }

    return NextResponse.json(setting.value);
  } catch (error: any) {
    console.error("GET Section Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing section id" }, { status: 400 });
    }

    const key = `section_${id}`;
    const value = await req.json();

    await connectToDatabase();
    
    await Setting.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, value });
  } catch (error: any) {
    console.error("PUT Section Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
