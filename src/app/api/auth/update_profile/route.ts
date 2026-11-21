import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, phone, address, current_password, new_password, avatar } = body;

    // Update basic fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (avatar) user.avatar = avatar;

    // Handle password change if requested
    if (new_password) {
      if (!current_password) {
        return NextResponse.json({ success: false, message: "Current password is required to set a new password." }, { status: 400 });
      }

      // Check current password
      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) {
        return NextResponse.json({ success: false, message: "Incorrect current password." }, { status: 400 });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(new_password, salt);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        name: user.name,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
