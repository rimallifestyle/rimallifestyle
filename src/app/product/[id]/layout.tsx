import type { Metadata } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    await connectToDatabase();

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).lean();
    }
    if (!product) {
      product = await Product.findOne({ slug: id }).lean();
    }

    if (!product) {
      return {
        title: 'Product Not Found | Rimal Lifestyle',
        description: 'Exclusive luxury menswear and accessories at Rimal Lifestyle.',
      };
    }

    const title = `${product.name} | Rimal Lifestyle`;
    const cleanDesc = product.shortDescription
      ? product.shortDescription.replace(/<[^>]*>?/gm, '').trim()
      : product.description
      ? product.description.replace(/<[^>]*>?/gm, '').slice(0, 200).trim()
      : `Explore ${product.name} at Rimal Lifestyle. Premium luxury craftsmanship.`;

    const imageUrl = product.image || (product.gallery && product.gallery[0]) || 'https://rimallifestyle.com/og-banner.jpg';
    const canonicalUrl = `https://rimallifestyle.com/product/${product.slug || product._id}`;

    return {
      title,
      description: cleanDesc,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description: cleanDesc,
        url: canonicalUrl,
        siteName: 'Rimal Lifestyle',
        type: 'website',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: cleanDesc,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: 'Rimal Lifestyle | Luxury Menswear',
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
