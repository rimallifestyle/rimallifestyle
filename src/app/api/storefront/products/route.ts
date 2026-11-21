import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch only published products
    const products = await Product.find({ status: 'published' }).sort({ createdAt: -1 }).lean();
    
    try {
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

      products.forEach((p: any) => {
        const directCat = resolveCat(p.category);
        const subCat = resolveCat(p.subCategory);
        const parentCat = resolveCat(p.parentCategory);

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

        p.category = effectiveSub ? effectiveSub.name : (directCat ? directCat.name : p.category);
        p.subCategory = effectiveSub ? effectiveSub.name : (p.subCategory ? p.subCategory : undefined);
        p.parentCategory = effectiveParent ? effectiveParent.name : (p.parentCategory ? p.parentCategory : undefined);
      });
    } catch (err) {
      console.log("Could not map categories in storefront:", err);
    }
    
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Error fetching storefront products:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

