import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Category from "@/models/Category";
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
    if (!id || id === "undefined") {
      return NextResponse.json({ message: "Invalid category ID" }, { status: 400 });
    }

    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await connectToDatabase();
    const body = await req.json();
    const { name, slug, description, parent, meta } = body;

    const updateData: any = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description,
      parent: parent || '0',
    };
    if (meta?._rimal_category_thumbnail !== undefined) {
      updateData.thumbnail = meta._rimal_category_thumbnail;
    }

    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await Category.findByIdAndUpdate(id, updateData, { new: true });
    }
    if (!updated) {
      updated = await Category.findOneAndUpdate({ slug: id }, updateData, { new: true });
    }

    if (!updated) return NextResponse.json({ message: "Category not found" }, { status: 404 });
    const doc = updated.toObject ? updated.toObject() : updated;
    const idStr = doc._id.toString();
    return NextResponse.json({
      ...doc,
      _id: idStr,
      id: idStr
    });
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || id === "undefined") {
      return NextResponse.json({ message: "Invalid category ID" }, { status: 400 });
    }

    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await connectToDatabase();
    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Category.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Category.findOneAndDelete({ slug: id });
    }

    if (!deleted) return NextResponse.json({ message: "Category not found" }, { status: 404 });
    
    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
