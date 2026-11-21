import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Attribute from "@/models/Attribute";

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

    const attributes = await Attribute.find().sort({ createdAt: -1 });
    
    // Map _id to id for frontend compatibility
    const formatted = attributes.map(attr => ({
      id: attr._id,
      name: attr.name,
      slug: attr.slug,
      type: attr.type,
      orderBy: attr.orderBy,
      terms: attr.terms
    }));

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
    const { name, slug, type, orderBy } = body;

    if (!name) {
      return NextResponse.json({ message: "Name is required." }, { status: 400 });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const newAttribute = new Attribute({
      name,
      slug: generatedSlug,
      type: type || 'text',
      orderBy: orderBy || 'custom',
      terms: []
    });

    await newAttribute.save();
    return NextResponse.json({
      id: newAttribute._id,
      name: newAttribute.name,
      slug: newAttribute.slug,
      type: newAttribute.type,
      orderBy: newAttribute.orderBy,
      terms: newAttribute.terms
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
