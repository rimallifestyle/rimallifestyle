import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Attribute from "@/models/Attribute";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return false;
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  return user?.role?.toLowerCase() === "admin";
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    
    // Check if this is a request to add/remove terms or edit attribute
    if (body.action === 'add_term') {
      const termSlug = body.term.slug || body.term.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const updated = await Attribute.findByIdAndUpdate(
        id,
        { $push: { terms: { ...body.term, slug: termSlug } } },
        { new: true }
      );
      return NextResponse.json(updated?.terms);
    } 
    else if (body.action === 'delete_term') {
      const updated = await Attribute.findByIdAndUpdate(
        id,
        { $pull: { terms: { _id: body.termId } } },
        { new: true }
      );
      return NextResponse.json(updated?.terms);
    }
    
    // Normal edit
    const { name, slug, type, orderBy } = body;
    const updated = await Attribute.findByIdAndUpdate(
      id,
      {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        type,
        orderBy
      },
      { new: true }
    );

    if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const deleted = await Attribute.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
