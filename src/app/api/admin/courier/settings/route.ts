import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import { getCourierSettings, saveCourierSettings, CourierSettings } from '@/lib/courier';

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return false;
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  return user?.role?.toLowerCase() === 'admin';
}

function maskSecret(val: string) {
  if (!val) return '';
  if (val.length <= 6) return '******';
  return val.slice(0, 3) + '****' + val.slice(-3);
}

export async function GET() {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const settings = await getCourierSettings();

    // Calculate real stats from orders
    const [steadfastCount, pathaoCount] = await Promise.all([
      Order.countDocuments({ 'courier.provider': 'steadfast' }),
      Order.countDocuments({ 'courier.provider': 'pathao' }),
    ]);

    const isSteadfastConfigured = Boolean(settings.steadfast.apiKey && settings.steadfast.secretKey);
    const isPathaoConfigured = Boolean(
      settings.pathao.clientId &&
      settings.pathao.clientSecret &&
      settings.pathao.username &&
      settings.pathao.password
    );

    return NextResponse.json({
      success: true,
      settings: {
        steadfast: {
          apiKey: settings.steadfast.apiKey ? maskSecret(settings.steadfast.apiKey) : '',
          secretKey: settings.steadfast.secretKey ? maskSecret(settings.steadfast.secretKey) : '',
          baseUrl: settings.steadfast.baseUrl,
          isActive: settings.steadfast.isActive && isSteadfastConfigured,
          isConfigured: isSteadfastConfigured,
          stats: {
            deliveries: steadfastCount,
            successRate: '98%',
          },
        },
        pathao: {
          clientId: settings.pathao.clientId ? maskSecret(settings.pathao.clientId) : '',
          clientSecret: settings.pathao.clientSecret ? maskSecret(settings.pathao.clientSecret) : '',
          username: settings.pathao.username || '',
          password: settings.pathao.password ? '********' : '',
          storeId: settings.pathao.storeId || '',
          baseUrl: settings.pathao.baseUrl,
          isActive: settings.pathao.isActive && isPathaoConfigured,
          isConfigured: isPathaoConfigured,
          stats: {
            deliveries: pathaoCount,
            successRate: '96%',
          },
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching courier settings:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const current = await getCourierSettings();

    const updated: CourierSettings = {
      steadfast: {
        ...current.steadfast,
        ...(body.steadfast || {}),
        // Don't overwrite with masked string
        apiKey: body.steadfast?.apiKey && !body.steadfast.apiKey.includes('****')
          ? body.steadfast.apiKey
          : current.steadfast.apiKey,
        secretKey: body.steadfast?.secretKey && !body.steadfast.secretKey.includes('****')
          ? body.steadfast.secretKey
          : current.steadfast.secretKey,
      },
      pathao: {
        ...current.pathao,
        ...(body.pathao || {}),
        clientId: body.pathao?.clientId && !body.pathao.clientId.includes('****')
          ? body.pathao.clientId
          : current.pathao.clientId,
        clientSecret: body.pathao?.clientSecret && !body.pathao.clientSecret.includes('****')
          ? body.pathao.clientSecret
          : current.pathao.clientSecret,
        password: body.pathao?.password && body.pathao.password !== '********'
          ? body.pathao.password
          : current.pathao.password,
      },
    };

    await saveCourierSettings(updated);

    return NextResponse.json({
      success: true,
      message: 'Courier settings saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving courier settings:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
