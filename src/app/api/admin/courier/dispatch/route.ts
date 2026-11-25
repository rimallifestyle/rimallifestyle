import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import { getCourierSettings, createSteadfastOrder, createPathaoOrder } from '@/lib/courier';

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return false;
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  return user?.role?.toLowerCase() === 'admin';
}

export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const {
      orderId, // Mongo _id or custom orderId (RLxxx)
      courierProvider = 'steadfast',
      recipientName,
      recipientPhone,
      recipientAddress,
      codAmount,
      note,
    } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Order ID is required.' }, { status: 400 });
    }

    await connectToDatabase();

    // Find order
    let order = await Order.findById(orderId).catch(() => null);
    if (!order) {
      order = await Order.findOne({ orderId });
    }
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found in database.' }, { status: 404 });
    }

    const settings = await getCourierSettings();

    // Steadfast Courier Dispatch
    if (courierProvider === 'steadfast') {
      const { apiKey, secretKey, baseUrl } = settings.steadfast;

      if (!apiKey || !secretKey) {
        return NextResponse.json({
          success: false,
          message: 'Steadfast Courier is not configured. Please enter your API Key and Secret Key in Admin > Couriers.',
        }, { status: 400 });
      }

      const dispatchResult = await createSteadfastOrder({
        apiKey,
        secretKey,
        baseUrl,
        invoice: order.orderId,
        recipientName: recipientName || order.customerName,
        recipientPhone: recipientPhone || order.customerPhone,
        recipientAddress: recipientAddress || order.customerAddress,
        codAmount: codAmount !== undefined ? codAmount : (order.paymentStatus === 'paid' ? 0 : order.total),
        note: note || `Order ${order.orderId} from Rimal Lifestyle`,
      });

      if (!dispatchResult.success) {
        return NextResponse.json({
          success: false,
          message: dispatchResult.message || 'Steadfast failed to create consignment.',
          raw: dispatchResult.raw,
        }, { status: 400 });
      }

      // Update Order in MongoDB
      order.status = 'shipped';
      order.courier = {
        provider: 'steadfast',
        trackingCode: dispatchResult.trackingCode || `TRK-${order.orderId}`,
        consignmentId: dispatchResult.consignmentId || '',
        dispatchedAt: new Date(),
        status: 'in_transit',
        courierResponse: dispatchResult.raw,
      };

      await order.save();

      return NextResponse.json({
        success: true,
        message: `Order successfully dispatched to Steadfast Courier! Consignment ID: ${dispatchResult.consignmentId || ''}`,
        trackingCode: dispatchResult.trackingCode,
        consignmentId: dispatchResult.consignmentId,
        order,
      });
    }

    // Pathao Courier Dispatch
    if (courierProvider === 'pathao') {
      const pathaoConfig = settings.pathao;

      if (!pathaoConfig.clientId || !pathaoConfig.clientSecret || !pathaoConfig.username || !pathaoConfig.password) {
        return NextResponse.json({
          success: false,
          message: 'Pathao Courier is not fully configured. Please configure your credentials in Admin > Couriers.',
        }, { status: 400 });
      }

      const dispatchResult = await createPathaoOrder({
        config: pathaoConfig,
        invoice: order.orderId,
        recipientName: recipientName || order.customerName,
        recipientPhone: recipientPhone || order.customerPhone,
        recipientAddress: recipientAddress || order.customerAddress,
        codAmount: codAmount !== undefined ? codAmount : (order.paymentStatus === 'paid' ? 0 : order.total),
        note: note || `Order ${order.orderId} from Rimal Lifestyle`,
      });

      if (!dispatchResult.success) {
        return NextResponse.json({
          success: false,
          message: dispatchResult.message || 'Pathao failed to create order.',
          raw: dispatchResult.raw,
        }, { status: 400 });
      }

      // Update Order in MongoDB
      order.status = 'shipped';
      order.courier = {
        provider: 'pathao',
        trackingCode: dispatchResult.trackingCode || `PTH-${order.orderId}`,
        consignmentId: dispatchResult.consignmentId || '',
        dispatchedAt: new Date(),
        status: 'in_transit',
        courierResponse: dispatchResult.raw,
      };

      await order.save();

      return NextResponse.json({
        success: true,
        message: `Order successfully dispatched to Pathao Courier! Consignment ID: ${dispatchResult.consignmentId || ''}`,
        trackingCode: dispatchResult.trackingCode,
        consignmentId: dispatchResult.consignmentId,
        order,
      });
    }

    return NextResponse.json({ success: false, message: 'Unsupported courier provider.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error dispatching order to courier:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
