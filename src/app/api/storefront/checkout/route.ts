import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { formData, cart, subTotal, shippingFee, userProfile } = body;
    
    if (!formData || !cart || cart.length === 0) {
      return NextResponse.json({ message: "Invalid request data", success: false }, { status: 400 });
    }
    
    const total = subTotal + shippingFee;
    
    // Generate a unique order ID: RM + 4 alphanumeric characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomCode = '';
    for (let i = 0; i < 4; i++) {
      randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const orderId = `RM${randomCode}`;
    
    // Use session email OR userProfile email provided from client
    const emailToUse = session?.user?.email || userProfile?.email;
    const isGuest = !emailToUse;
    const userEmail = emailToUse || undefined;
    let userId = undefined;
    let userProfileName = undefined;
    let customerAvatar = undefined;
    
    if (userEmail) {
      const User = require('@/models/User').default;
      const dbUser = await User.findOne({ email: userEmail });
      if (dbUser) {
        userId = dbUser._id.toString();
        userProfileName = dbUser.name || session?.user?.name || userProfile?.name;
        customerAvatar = dbUser.avatar || session?.user?.image || userProfile?.avatar;
      } else {
        userProfileName = session?.user?.name || userProfile?.name || undefined;
        customerAvatar = session?.user?.image || userProfile?.avatar || undefined;
      }
    } else if (userProfile) {
      userProfileName = userProfile.name || undefined;
      customerAvatar = userProfile.avatar || undefined;
    }
    
    const newOrder = new Order({
      orderId,
      customerName: formData.name,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      isGuest,
      userEmail,
      userId,
      userProfileName,
      customerAvatar,
      cart,
      subTotal,
      shippingFee,
      total,
      status: 'pending',
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'pending'
    });
    
    await newOrder.save();
    
    return NextResponse.json({ 
      success: true, 
      order_id: orderId,
      message: "Order placed successfully" 
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal Server Error", 
      error: error.message 
    }, { status: 500 });
  }
}
