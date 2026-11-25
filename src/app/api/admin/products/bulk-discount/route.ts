import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return false;
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  return user?.role?.toLowerCase() === 'admin';
}

export async function GET() {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    await connectToDatabase();

    const [totalProducts, onSaleCount, siteSaleSetting] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ salePrice: { $exists: true, $ne: null } }),
      Setting.findOne({ key: 'site_wide_sale' }),
    ]);

    return NextResponse.json({
      success: true,
      totalProducts,
      onSaleCount,
      siteSale: siteSaleSetting?.value || null,
    });
  } catch (error: any) {
    console.error('Error fetching bulk discount status:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { action, percentage } = body;

    await connectToDatabase();

    if (action === 'apply') {
      const discount = Number(percentage);
      if (isNaN(discount) || discount <= 0 || discount >= 100) {
        return NextResponse.json({
          success: false,
          message: 'Please provide a valid discount percentage between 1 and 99.',
        }, { status: 400 });
      }

      // Fetch all products that have a regular price
      const products = await Product.find({ regularPrice: { $gt: 0 } });

      const bulkOps = products.map((prod) => {
        const salePrice = Math.round(prod.regularPrice * (1 - discount / 100));
        return {
          updateOne: {
            filter: { _id: prod._id },
            update: { $set: { salePrice } },
          },
        };
      });

      if (bulkOps.length > 0) {
        await Product.bulkWrite(bulkOps);
      }

      // Save active site sale setting
      await Setting.findOneAndUpdate(
        { key: 'site_wide_sale' },
        {
          key: 'site_wide_sale',
          value: {
            active: true,
            percentage: discount,
            appliedAt: new Date(),
            productsCount: bulkOps.length,
          },
        },
        { upsert: true, new: true }
      );

      return NextResponse.json({
        success: true,
        count: bulkOps.length,
        message: `Successfully applied ${discount}% discount to all ${bulkOps.length} products!`,
      });
    }

    if (action === 'reset') {
      const result = await Product.updateMany(
        { salePrice: { $exists: true } },
        { $unset: { salePrice: '' } }
      );

      await Setting.findOneAndUpdate(
        { key: 'site_wide_sale' },
        {
          key: 'site_wide_sale',
          value: {
            active: false,
            percentage: 0,
            resetAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      return NextResponse.json({
        success: true,
        count: result.modifiedCount,
        message: `Reset complete! Sale prices removed from ${result.modifiedCount} products.`,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error applying bulk discount:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
