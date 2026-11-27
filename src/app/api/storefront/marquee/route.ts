import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: "marquee" });

    if (!setting || !setting.value) {
      return NextResponse.json({
        enabled: true,
        speed: 16,
        items: [
          { id: "1", text: "FREE SHIPPING ON ORDERS OVER ৳5,000" },
          { id: "2", text: "NEW SUMMER COLLECTION ARRIVED" },
          { id: "3", text: "10% OFF ON YOUR FIRST ORDER" }
        ]
      });
    }

    const val = setting.value;

    // If saved as an array of items
    if (Array.isArray(val)) {
      const items = val.map((x: any, idx: number) => {
        if (typeof x === "string") return { id: String(idx + 1), text: x };
        return { id: x.id || String(idx + 1), text: x.text || "" };
      }).filter((item: any) => Boolean(item.text));
      return NextResponse.json({ enabled: true, speed: 16, items });
    }

    // If saved as an object
    if (typeof val === "object") {
      const rawItems = Array.isArray(val.items) ? val.items : [];
      const items = rawItems.map((x: any, idx: number) => {
        if (typeof x === "string") return { id: String(idx + 1), text: x };
        return { id: x.id || String(idx + 1), text: x.text || "" };
      }).filter((item: any) => Boolean(item.text));

      return NextResponse.json({
        enabled: val.enabled !== false,
        speed: typeof val.speed === "number" ? val.speed : 16,
        items
      });
    }

    return NextResponse.json({ enabled: true, speed: 16, items: [] });
  } catch (error: any) {
    console.error("GET Marquee Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    await connectToDatabase();

    let valueToSave: any;
    if (Array.isArray(body)) {
      valueToSave = {
        enabled: true,
        speed: 16,
        items: body.map((x: any, idx: number) => ({
          id: x.id || String(idx + 1),
          text: typeof x === "string" ? x : (x.text || "")
        }))
      };
    } else if (body && typeof body === "object") {
      const items = Array.isArray(body.items)
        ? body.items.map((x: any, idx: number) => ({
            id: x.id || String(idx + 1),
            text: typeof x === "string" ? x : (x.text || "")
          }))
        : [];
      valueToSave = {
        enabled: body.enabled !== false,
        speed: typeof body.speed === "number" ? body.speed : 16,
        items
      };
    } else {
      valueToSave = { enabled: true, speed: 16, items: [] };
    }

    await Setting.findOneAndUpdate(
      { key: "marquee" },
      { key: "marquee", value: valueToSave },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, value: valueToSave });
  } catch (error: any) {
    console.error("PUT Marquee Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
