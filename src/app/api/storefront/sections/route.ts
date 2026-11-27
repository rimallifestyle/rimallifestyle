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
  category_showcase: {
    eyebrow: "Curated Selections",
    title: "The Rimal wardrobe, considered.",
    description: "Explore our signature collections crafted with modern luxury.",
    maxProducts: 8,
    category: "",
  },
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await connectToDatabase();

    // Get deleted sections set
    const deletedSetting = await Setting.findOne({ key: 'deleted_sections' }).lean();
    const deletedIds: string[] = Array.isArray(deletedSetting?.value?.ids) ? deletedSetting.value.ids : [];

    // If an ID is provided, return that specific section
    if (id) {
      if (deletedIds.includes(id)) {
        return NextResponse.json({ error: "Section not found or deleted" }, { status: 404 });
      }
      const key = `section_${id}`;
      const setting = await Setting.findOne({ key });

      const defaults = DEFAULT_SECTIONS[id] || {
        eyebrow: "Category",
        title: id.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
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

    // Initialize with defaults (excluding deleted ones)
    Object.keys(DEFAULT_SECTIONS).forEach(secId => {
      if (!deletedIds.includes(secId)) {
        result[secId] = { id: secId, ...DEFAULT_SECTIONS[secId] };
      }
    });

    // Merge saved settings from DB (excluding deleted ones)
    settings.forEach((s: any) => {
      const secId = s.key.replace(/^section_/, '');
      if (!deletedIds.includes(secId)) {
        result[secId] = {
          ...(result[secId] || { id: secId, ...DEFAULT_SECTIONS[secId] || {
            eyebrow: "",
            title: secId.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            description: "",
            maxProducts: 8,
            category: "",
          } }),
          ...s.value,
          id: secId,
        };
      }
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

    // If section was marked deleted, restore it
    const deletedSetting = await Setting.findOne({ key: 'deleted_sections' });
    if (deletedSetting && Array.isArray(deletedSetting.value?.ids) && deletedSetting.value.ids.includes(id)) {
      const updatedIds = deletedSetting.value.ids.filter((x: string) => x !== id);
      await Setting.findOneAndUpdate(
        { key: 'deleted_sections' },
        { key: 'deleted_sections', value: { ids: updatedIds } }
      );
    }

    // Ensure section exists in homepage_layout so it can be viewed and reordered
    const layoutSetting = await Setting.findOne({ key: 'homepage_layout' });
    if (layoutSetting && Array.isArray(layoutSetting.value?.sections)) {
      const layoutId = id === 'category_showcase' ? 'categories' : id;
      const exists = layoutSetting.value.sections.some((s: any) => s.id === layoutId);
      if (!exists) {
        const updatedSections = [...layoutSetting.value.sections, { id: layoutId, enabled: value.enabled !== false }];
        await Setting.findOneAndUpdate(
          { key: 'homepage_layout' },
          { key: 'homepage_layout', value: { sections: updatedSections } }
        );
      }
    }

    return NextResponse.json({ success: true, value });
  } catch (error: any) {
    console.error("PUT Section Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing section id" }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Delete specific section setting
    await Setting.deleteOne({ key: `section_${id}` });

    // 2. Add id to deleted_sections list
    const deletedSetting = await Setting.findOne({ key: 'deleted_sections' });
    const currentDeleted: string[] = Array.isArray(deletedSetting?.value?.ids) ? deletedSetting.value.ids : [];
    if (!currentDeleted.includes(id)) {
      currentDeleted.push(id);
      await Setting.findOneAndUpdate(
        { key: 'deleted_sections' },
        { key: 'deleted_sections', value: { ids: currentDeleted } },
        { upsert: true }
      );
    }

    // 3. Remove from homepage_layout
    const layoutSetting = await Setting.findOne({ key: 'homepage_layout' });
    if (layoutSetting && Array.isArray(layoutSetting.value?.sections)) {
      const layoutId = id === 'category_showcase' ? 'categories' : id;
      const updatedSections = layoutSetting.value.sections.filter((s: any) => s.id !== layoutId && s.id !== id);
      await Setting.findOneAndUpdate(
        { key: 'homepage_layout' },
        { key: 'homepage_layout', value: { sections: updatedSections } }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("DELETE Section Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
