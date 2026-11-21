import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    const count = await Order.countDocuments({ isSeen: { $ne: true } });
    
    return NextResponse.json({ count });
  } catch (error: any) {
    console.error('Error fetching unseen orders count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unseen orders count' },
      { status: 500 }
    );
  }
}
