import { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Setting from '@/models/Setting';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let siteUrl = 'https://rimallifestyle.com';

  try {
    await connectToDatabase();
    const seoSetting = await Setting.findOne({ key: 'seo_settings' }).lean();
    if (seoSetting?.value?.siteUrl) {
      siteUrl = seoSetting.value.siteUrl.replace(/\/$/, '');
    }
  } catch (e) {
    console.error('Error fetching site URL for sitemap:', e);
  }

  // Core static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Category routes
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    await connectToDatabase();
    const categories = await Category.find({}, 'slug updatedAt').lean();
    categoryRoutes = categories
      .filter((cat: any) => Boolean(cat.slug))
      .map((cat: any) => ({
        url: `${siteUrl}/shop?category=${encodeURIComponent(cat.slug)}`,
        lastModified: cat.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
  } catch (err) {
    console.error('Error fetching categories for sitemap:', err);
  }

  // Dynamic Product routes
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    await connectToDatabase();
    const products = await Product.find({ status: 'published' }, 'slug _id updatedAt').lean();
    productRoutes = products.map((prod: any) => ({
      url: `${siteUrl}/product/${prod.slug || prod._id.toString()}`,
      lastModified: prod.updatedAt || new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }));
  } catch (err) {
    console.error('Error fetching products for sitemap:', err);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
