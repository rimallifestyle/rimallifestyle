import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: "hero_sliders" });

    if (!setting || setting.value?.length === 0) {
      return NextResponse.json([
        {
          image: "/src/assets/banner-1.jpg",
          kicker: "Autumn / Winter Collection",
          title: "Crafted for the modern gentleman",
          sub: "Discover our signature maroon silk shirt — hand-finished in limited numbers.",
          cta: "Shop the collection",
          ctaLink: "#new"
        },
        {
          image: "/src/assets/banner-2.jpg",
          kicker: "Premium Fabrics",
          title: "Luxury in every thread",
          sub: "Experience the unmatched comfort of our new cotton-linen blends.",
          cta: "Explore Fabrics",
          ctaLink: "#premium"
        },
        {
          image: "/src/assets/banner-3.jpg",
          kicker: "The Heritage Edit",
          title: "Timeless Style",
          sub: "Classic silhouettes tailored for contemporary life.",
          cta: "View Heritage",
          ctaLink: "#heritage"
        }
      ]);
    }

    return NextResponse.json(setting.value);
  } catch (error: any) {
    console.error("GET Sliders Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const value = await req.json();

    await connectToDatabase();
    
    await Setting.findOneAndUpdate(
      { key: "hero_sliders" },
      { key: "hero_sliders", value },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, value });
  } catch (error: any) {
    console.error("PUT Sliders Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
