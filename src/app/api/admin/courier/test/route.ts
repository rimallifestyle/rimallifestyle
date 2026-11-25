import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getCourierSettings, testSteadfastConnection, testPathaoConnection } from '@/lib/courier';

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
    const { provider, credentials } = body;

    const current = await getCourierSettings();

    if (provider === 'steadfast') {
      const apiKey = credentials?.apiKey && !credentials.apiKey.includes('****')
        ? credentials.apiKey
        : current.steadfast.apiKey;
      const secretKey = credentials?.secretKey && !credentials.secretKey.includes('****')
        ? credentials.secretKey
        : current.steadfast.secretKey;
      const baseUrl = credentials?.baseUrl || current.steadfast.baseUrl;

      if (!apiKey || !secretKey) {
        return NextResponse.json({
          success: false,
          message: 'Steadfast API Key and Secret Key are required to test connection.',
        });
      }

      const result = await testSteadfastConnection(apiKey, secretKey, baseUrl);
      return NextResponse.json(result);
    }

    if (provider === 'pathao') {
      const clientId = credentials?.clientId && !credentials.clientId.includes('****')
        ? credentials.clientId
        : current.pathao.clientId;
      const clientSecret = credentials?.clientSecret && !credentials.clientSecret.includes('****')
        ? credentials.clientSecret
        : current.pathao.clientSecret;
      const username = credentials?.username || current.pathao.username;
      const password = credentials?.password && credentials.password !== '********'
        ? credentials.password
        : current.pathao.password;
      const baseUrl = credentials?.baseUrl || current.pathao.baseUrl;

      if (!clientId || !clientSecret || !username || !password) {
        return NextResponse.json({
          success: false,
          message: 'All Pathao credentials (Client ID, Secret, Username, Password) are required.',
        });
      }

      const result = await testPathaoConnection({ clientId, clientSecret, username, password, baseUrl });
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, message: 'Invalid courier provider.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error testing courier connection:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
