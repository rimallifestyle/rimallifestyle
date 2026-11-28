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
    
    // Generate a unique order ID: RL + 3 characters (e.g. RL101, RL842, RL7B2)
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let orderId = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 20) {
      let randomCode = '';
      for (let i = 0; i < 3; i++) {
        randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      orderId = `RL${randomCode}`;
      const existing = await Order.findOne({ orderId });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }
    if (!orderId) {
      orderId = `RL${Math.floor(100 + Math.random() * 900)}`;
    }
    
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

    // Trigger OneSignal push notification for new order alert
    try {
      const Setting = (await import("@/models/Setting")).default;
      const osSetting = await Setting.findOne({ key: "onesignal_settings" }).lean();
      if (osSetting?.value?.enabled && osSetting?.value?.appId && osSetting?.value?.apiKey) {
        fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${String(osSetting.value.apiKey).trim()}`
          },
          body: JSON.stringify({
            app_id: String(osSetting.value.appId).trim(),
            included_segments: ["Subscribed Users"],
            headings: { en: `🛍️ New Order #${orderId} Received!` },
            contents: { en: `${formData.name || 'A customer'} placed an order for ৳${total.toLocaleString()}` },
            url: `https://rimallifestyle.com/admin/orders`
          })
        }).catch(err => console.error("OneSignal order push failed:", err));
      }
    } catch (pushErr) {
      console.error("Error triggering order push notification:", pushErr);
    }
    
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
