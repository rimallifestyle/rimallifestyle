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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, slug, description } = body;

    const updated = await Tag.findByIdAndUpdate(
      id,
      {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description
      },
      { new: true }
    );

    if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({
      id: updated._id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      count: updated.count
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const deleted = await Tag.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
