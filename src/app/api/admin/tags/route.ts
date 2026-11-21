import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Tag from "@/models/Tag";

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

    const tags = await Tag.find().sort({ createdAt: -1 });
    return NextResponse.json(tags.map(t => ({
      id: t._id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      count: t.count
    })));
  } catch (error: any) {
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, slug, description } = body;

    if (!name) {
      return NextResponse.json({ message: "Name is required." }, { status: 400 });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const newTag = new Tag({
      name,
      slug: generatedSlug,
      description,
      count: 0
    });

    await newTag.save();
    return NextResponse.json({
      id: newTag._id,
      name: newTag.name,
      slug: newTag.slug,
      description: newTag.description,
      count: newTag.count
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
