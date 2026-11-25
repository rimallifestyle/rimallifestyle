import { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  let siteUrl = 'https://rimallifestyle.com';
  let allowIndexing = true;

  try {
    await connectToDatabase();
    const seoSetting = await Setting.findOne({ key: 'seo_settings' }).lean();
    if (seoSetting?.value?.siteUrl) {
      siteUrl = seoSetting.value.siteUrl.replace(/\/$/, '');
    }
    if (typeof seoSetting?.value?.allowIndexing === 'boolean') {
      allowIndexing = seoSetting.value.allowIndexing;
    }
  } catch (e) {
    console.error('Error loading robots settings:', e);
  }

  if (!allowIndexing) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/admin',
          '/api/admin/*',
          '/api/auth',
          '/api/auth/*',
          '/account',
          '/account/*',
          '/cart',
          '/checkout',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
