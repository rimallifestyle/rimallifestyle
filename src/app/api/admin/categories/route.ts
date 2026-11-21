import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Category from "@/models/Category";

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return false;
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  return user?.role?.toLowerCase() === "admin";
}

export async function GET(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const categories = await Category.find().sort({ createdAt: -1 });
    const formatted = categories.map((cat: any) => {
      const doc = cat.toObject ? cat.toObject() : cat;
      const idStr = (doc._id || doc.id).toString();
      return {
        ...doc,
        _id: idStr,
        id: idStr,
        parent: doc.parent || (doc.parentId ? doc.parentId.toString() : '0'),
        count: doc.count || 0
      };
    });
    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, slug, description, parent, meta } = body;

    if (!name) {
      return NextResponse.json({ message: "Name is required." }, { status: 400 });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const newCategory = new Category({
      name,
      slug: generatedSlug,
      description,
      parent: parent || '0',
      thumbnail: meta?._rimal_category_thumbnail
    });

    await newCategory.save();
    const doc = newCategory.toObject ? newCategory.toObject() : newCategory;
    const idStr = doc._id.toString();
    return NextResponse.json({
      ...doc,
      _id: idStr,
      id: idStr
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
