import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = 'force-dynamic';

// Protect route to admin only
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: any = {};
    if (role && role !== "all") query.role = role;
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    // Calculate stats
    const [totalUsers, activeUsers, bannedUsers, newThisMonth] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "banned" }),
      User.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }),
    ]);

    // Format for frontend
    const formattedUsers = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      phone: u.phone || null,
      address: u.address || null,
      avatar: u.avatar || null,
      created_at: u.createdAt,
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      stats: {
        total: totalUsers.toString(),
        active: activeUsers.toString(),
        banned: bannedUsers.toString(),
        new_this_month: newThisMonth.toString(),
      },
    });
  } catch (error: any) {
    console.error("GET Users Error:", error);
    return NextResponse.json({ message: "Failed to load users" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { id, role, status } = body;

    if (!id) return NextResponse.json({ message: "User ID required" }, { status: 400 });

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role, status },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("PUT Users Error:", error);
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ message: "User ID required" }, { status: 400 });

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error: any) {
    console.error("DELETE Users Error:", error);
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
  }
}
