import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return false;
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  return user?.role?.toLowerCase() === "admin";
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const resolvedParams = await params;
    const order = await Order.findByIdAndUpdate(
      resolvedParams.id, 
      { $set: { isSeen: true } },
      { new: true }
    ).lean();
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { status } = body;
    
    if (!status) return NextResponse.json({ message: "Status is required" }, { status: 400 });

    const resolvedParams = await params;
    const order = await Order.findByIdAndUpdate(
      resolvedParams.id,
      { $set: { status } },
      { new: true }
    ).lean();

    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    return NextResponse.json({ message: "Status updated successfully", order });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
