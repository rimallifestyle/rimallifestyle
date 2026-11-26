import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";

export const dynamic = 'force-dynamic';

const DEFAULT_SECTIONS: Record<string, { eyebrow: string; title: string; description: string; maxProducts: number; category: string }> = {
  new: {
    eyebrow: "Just landed",
    title: "New arrivals",
    description: "Fresh drops from the atelier — hand-picked pieces to build your wardrobe.",
    maxProducts: 8,
    category: "all",
  },
  shirts: {
    eyebrow: "Shirt category",
    title: "Shirts, tailored.",
    description: "From crisp oxfords to weekend linens — shirts made for every occasion.",
    maxProducts: 8,
    category: "",
  },
  tshirts: {
    eyebrow: "T-Shirt category",
    title: "Essential tees.",
    description: "Elevated basics in heavyweight cotton and premium blends.",
    maxProducts: 8,
    category: "",
  },
  polos: {
    eyebrow: "Polo collection",
    title: "The perfect polo.",
    description: "Refined piqué and merino polos — a smarter alternative to the t-shirt.",
    maxProducts: 8,
    category: "",
  },
  pants: {
    eyebrow: "Trouser category",
    title: "Trousers & chinos.",
    description: "Precise cuts and considered fabrics — from tailored wool to everyday chinos.",
    maxProducts: 8,
    category: "",
  },
  jackets: {
    eyebrow: "Outerwear",
    title: "Jackets & coats.",
    description: "Statement outerwear designed for cold days and warm compliments.",
    maxProducts: 8,
    category: "",
  },
  hats: {
    eyebrow: "Headwear",
    title: "Hats & caps.",
    description: "Finish every look — from fedoras to flat caps, wool to leather.",
    maxProducts: 8,
    category: "",
  },
  panjabi: {
    eyebrow: "Traditional · Festive",
    title: "The Panjabi edit.",
    description: "Traditional silhouettes reimagined with modern craft — for weddings, festivals, and every moment worth dressing for.",
    maxProducts: 8,
    category: "",
  },
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await connectToDatabase();

    // If an ID is provided, return that specific section
    if (id) {
      const key = `section_${id}`;
      const setting = await Setting.findOne({ key });

      const defaults = DEFAULT_SECTIONS[id] || {
        eyebrow: "Category",
        title: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: `Discover our collection of ${id.replace(/_/g, ' ')}.`,
        maxProducts: 8,
        category: "",
      };

      if (!setting) {
        return NextResponse.json({ id, ...defaults });
      }

      return NextResponse.json({ id, ...defaults, ...setting.value });
    }

    // If no ID is provided, return all section settings as an object map
    const settings = await Setting.find({ key: { $regex: '^section_' } }).lean();
    const result: Record<string, any> = {};

    // Initialize with defaults
    Object.keys(DEFAULT_SECTIONS).forEach(secId => {
      result[secId] = { id: secId, ...DEFAULT_SECTIONS[secId] };
    });

    // Merge saved settings from DB
    settings.forEach((s: any) => {
      const secId = s.key.replace(/^section_/, '');
      result[secId] = {
        ...(result[secId] || { id: secId, ...DEFAULT_SECTIONS[secId] }),
        ...s.value,
        id: secId,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET Section Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const id = searchParams.get("id") || body?.id;

    if (!id) {
      return NextResponse.json({ error: "Missing section id" }, { status: 400 });
    }

    const key = `section_${id}`;
    const value = { ...body, id };

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
