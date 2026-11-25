import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Setting from "@/models/Setting";

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return false;
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  return user?.role?.toLowerCase() === "admin";
}

export async function GET() {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    // 1. Fetch persistent notification state (clearedBefore, readIds)
    const stateSetting = await Setting.findOne({ key: "admin_notification_state" }).lean();
    const readIds: string[] = stateSetting?.value?.readIds || [];
    const clearedBefore: Date | null = stateSetting?.value?.clearedBefore ? new Date(stateSetting.value.clearedBefore) : null;

    const readIdSet = new Set(readIds);

    // 2. Fetch recent orders
    const orderQuery: any = {};
    if (clearedBefore) {
      orderQuery.createdAt = { $gt: clearedBefore };
    }
    const orders = await Order.find(orderQuery)
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const orderNotifications = orders.map((order: any) => {
      const id = `order-${order._id.toString()}`;
      const isRead = order.isSeen === true || readIdSet.has(id);
      return {
        id,
        dbId: order._id.toString(),
        type: 'order' as const,
        title: `New Order #${order.orderId || order._id.toString().slice(-6)}`,
        message: `${order.customerName || 'A customer'} placed an order for ৳${(order.total || 0).toLocaleString()} (${order.paymentMethod || 'COD'}).`,
        timestamp: order.createdAt,
        isRead,
        link: `/admin/orders`,
        data: {
          orderId: order.orderId,
          total: order.total,
          status: order.status,
          customerName: order.customerName,
          itemsCount: order.cart?.length || 0,
        }
      };
    });

    // 3. Fetch low stock / out of stock products
    const lowStockProducts = await Product.find({
      status: 'published',
      $or: [
        { stockQuantity: { $lte: 5 } }
      ]
    })
      .sort({ stockQuantity: 1 })
      .limit(10)
      .lean();

    const stockNotifications: any[] = [];
    for (const prod of lowStockProducts) {
      const id = `stock-${prod._id.toString()}`;
      const isOut = (prod.stockQuantity || 0) <= 0;
      const isRead = readIdSet.has(id);

      // Check if product was cleared before its last update
      if (clearedBefore && new Date(prod.updatedAt || prod.createdAt) <= clearedBefore) {
        continue;
      }

      stockNotifications.push({
        id,
        dbId: prod._id.toString(),
        type: 'stock' as const,
        title: isOut ? 'Out of Stock Alert' : 'Low Stock Warning',
        message: `${prod.name} ${isOut ? 'is currently out of stock.' : `has only ${prod.stockQuantity} items remaining in stock.`}`,
        timestamp: prod.updatedAt || prod.createdAt,
        isRead,
        link: `/admin/products/add?id=${prod._id.toString()}`,
        data: {
          stockQuantity: prod.stockQuantity || 0,
          sku: prod.sku,
          image: prod.image,
          price: prod.regularPrice
        }
      });
    }

    // 4. Fetch recent customer registrations
    const userQuery: any = { role: { $ne: 'admin' } };
    if (clearedBefore) {
      userQuery.createdAt = { $gt: clearedBefore };
    }
    const recentUsers = await User.find(userQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const customerNotifications = recentUsers.map((u: any) => {
      const id = `customer-${u._id.toString()}`;
      return {
        id,
        dbId: u._id.toString(),
        type: 'customer' as const,
        title: 'New Customer Registered',
        message: `${u.name || 'A new customer'} signed up with ${u.email || u.phone || 'store'}.`,
        timestamp: u.createdAt,
        isRead: readIdSet.has(id),
        link: `/admin/users`,
        data: {
          name: u.name,
          email: u.email
        }
      };
    });

    // Combine and sort by timestamp descending
    const allNotifications = [...orderNotifications, ...stockNotifications, ...customerNotifications]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const unreadCount = allNotifications.filter(n => !n.isRead).length;

    return NextResponse.json({
      notifications: allNotifications,
      unreadCount,
      summary: {
        total: allNotifications.length,
        unread: unreadCount,
        orders: orderNotifications.length,
        stock: stockNotifications.length,
        customers: customerNotifications.length
      }
    });
  } catch (error: any) {
    console.error("Error fetching admin notifications:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { action, id } = body;

    let stateSetting = await Setting.findOne({ key: "admin_notification_state" });
    if (!stateSetting) {
      stateSetting = new Setting({
        key: "admin_notification_state",
        value: { readIds: [], clearedBefore: null }
      });
    }

    const currentReadIds: string[] = stateSetting.value?.readIds || [];
    const readIdSet = new Set(currentReadIds);

    if (action === "mark_all_read") {
      // Mark all orders as seen
      await Order.updateMany({ isSeen: { $ne: true } }, { $set: { isSeen: true } });

      // Gather current unread notification ids from orders, products, users
      const unseenOrders = await Order.find({}, '_id').lean();
      unseenOrders.forEach(o => readIdSet.add(`order-${o._id.toString()}`));

      const lowStock = await Product.find({ status: 'published', stockQuantity: { $lte: 5 } }, '_id').lean();
      lowStock.forEach(p => readIdSet.add(`stock-${p._id.toString()}`));

      const users = await User.find({ role: { $ne: 'admin' } }, '_id').lean();
      users.forEach(u => readIdSet.add(`customer-${u._id.toString()}`));

      stateSetting.value = {
        ...stateSetting.value,
        readIds: Array.from(readIdSet)
      };
      stateSetting.markModified('value');
      await stateSetting.save();

      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (action === "mark_read" && id) {
      readIdSet.add(id);

      if (id.startsWith("order-")) {
        const orderId = id.replace("order-", "");
        await Order.findByIdAndUpdate(orderId, { $set: { isSeen: true } });
      }

      stateSetting.value = {
        ...stateSetting.value,
        readIds: Array.from(readIdSet)
      };
      stateSetting.markModified('value');
      await stateSetting.save();

      return NextResponse.json({ success: true, message: `Notification ${id} marked as read.` });
    }

    if (action === "clear_all") {
      stateSetting.value = {
        readIds: [],
        clearedBefore: new Date()
      };
      stateSetting.markModified('value');
      await stateSetting.save();

      // Also set orders isSeen to true
      await Order.updateMany({ isSeen: { $ne: true } }, { $set: { isSeen: true } });

      return NextResponse.json({ success: true, message: "All notifications cleared." });
    }

    return NextResponse.json({ message: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating admin notifications:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
