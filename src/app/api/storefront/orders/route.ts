import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Fallback to checking the Authorization header or userEmail query param if session is not available
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get('email');
    
    const userEmail = session?.user?.email || emailParam;
    
    if (!userEmail) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
    }
    
    // Find orders for this email, sort by descending creation date
    const orders = await Order.find({ userEmail }).sort({ createdAt: -1 });
    
    return NextResponse.json({ orders, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
