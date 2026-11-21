import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    let product;
    // Check if ID is a valid ObjectId, otherwise treat it as a slug
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).lean();
    } else {
      product = await Product.findOne({ slug: id }).lean();
    }
    
    if (!product || product.status !== 'published') {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    
    try {
      const Category = require("@/models/Category").default || require("@/models/Category");
      const categories = await Category.find().lean();
      
      const idToCat = new Map<string, any>();
      const nameToCat = new Map<string, any>();
      
      categories.forEach((c: any) => {
        const idStr = c._id.toString();
        idToCat.set(idStr, c);
        if (c.name) nameToCat.set(c.name.toLowerCase().trim(), c);
        if (c.slug) nameToCat.set(c.slug.toLowerCase().trim(), c);
      });

      const resolveCat = (val: any) => {
        if (!val) return null;
        const str = val.toString().trim();
        if (idToCat.has(str)) return idToCat.get(str);
        const lower = str.toLowerCase();
        if (nameToCat.has(lower)) return nameToCat.get(lower);
        return null;
      };

      const directCat = resolveCat(product.category);
      const subCat = resolveCat(product.subCategory);
      const parentCat = resolveCat(product.parentCategory);

      // Subcategory resolution
      const effectiveSub = subCat || (directCat && directCat.parent && directCat.parent !== '0' ? directCat : null);
      
      // Parent category resolution
      let effectiveParent = parentCat;
      if (!effectiveParent && effectiveSub && effectiveSub.parent && effectiveSub.parent !== '0') {
        effectiveParent = resolveCat(effectiveSub.parent);
      }
      if (!effectiveParent && directCat && directCat.parent && directCat.parent !== '0') {
        effectiveParent = resolveCat(directCat.parent);
      }

      product.category = effectiveSub ? effectiveSub.name : (directCat ? directCat.name : product.category);
      product.subCategory = effectiveSub ? effectiveSub.name : (product.subCategory || undefined);
      product.parentCategory = effectiveParent ? effectiveParent.name : (product.parentCategory || undefined);
    } catch (err) {
      console.log("Could not map category in storefront single product:", err);
    }
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error fetching storefront product:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
