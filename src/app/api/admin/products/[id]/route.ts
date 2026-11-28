import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product";

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return false;
  await connectToDatabase();
  const cleanEmail = session.user.email.trim();
  const user = await User.findOne({
    email: { $regex: new RegExp(`^${cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, "i") }
  });
  return user?.role?.toLowerCase() === "admin";
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });
    
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { 
      name, shortDescription, description, customTabs, regularPrice, salePrice, sku, stockQuantity, 
      category, parentCategory, subCategory, image, gallery, globalAttributes, productAttributes, variantStocks, status 
    } = body;

    let slug;
    if (name) {
      slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      if (!slug || slug.trim() === '') {
        slug = `product-${Date.now()}`;
      }
      let slugExists = await Product.findOne({ slug, _id: { $ne: id } });
      if (slugExists) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updateFields: any = {};
    if (name) updateFields.name = String(name).trim();
    if (slug) updateFields.slug = slug;
    if (shortDescription !== undefined) updateFields.shortDescription = shortDescription;
    if (description !== undefined) updateFields.description = description;
    if (customTabs !== undefined) updateFields.customTabs = Array.isArray(customTabs) ? customTabs : [];
    if (regularPrice !== undefined && regularPrice !== null && String(regularPrice).trim() !== '') {
      updateFields.regularPrice = Number(regularPrice);
    }
    if (salePrice !== undefined) {
      updateFields.salePrice = Number(salePrice) > 0 ? Number(salePrice) : undefined;
    }
    if (sku !== undefined) updateFields.sku = sku;
    if (stockQuantity !== undefined && stockQuantity !== null && String(stockQuantity).trim() !== '') {
      updateFields.stockQuantity = Number(stockQuantity);
    }
    if (category || subCategory || parentCategory) {
      updateFields.category = category || subCategory || parentCategory;
    }
    if (parentCategory !== undefined) updateFields.parentCategory = parentCategory || undefined;
    if (subCategory !== undefined) updateFields.subCategory = subCategory || undefined;
    if (image !== undefined) updateFields.image = image;
    if (gallery !== undefined) updateFields.gallery = Array.isArray(gallery) ? gallery : [];
    if (globalAttributes !== undefined) updateFields.globalAttributes = globalAttributes;
    if (productAttributes !== undefined) updateFields.productAttributes = productAttributes;
    if (variantStocks !== undefined) updateFields.variantStocks = variantStocks;
    if (status !== undefined) updateFields.status = status === 'draft' ? 'draft' : 'published';

    const updated = await Product.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
