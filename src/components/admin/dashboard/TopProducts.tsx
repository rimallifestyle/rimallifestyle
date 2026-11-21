"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, PackagePlus } from 'lucide-react'

interface TopProduct {
  id?: string
  name: string
  category: string
  sales: number
  revenue?: number
  image: string
}

interface TopProductsProps {
  products?: TopProduct[]
}

export function TopProducts({ products = [] }: TopProductsProps) {
  const router = useRouter()

  return (
    <div className="glass-card rounded-3xl p-6 h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-white/90">Top Products</h2>
          <p className="text-xs text-white/50 mt-0.5">Best performing items</p>
        </div>
        <Link 
          href="/admin/products" 
          className="px-4 py-1.5 rounded-full glass-button text-xs font-medium text-white/80 hover:text-white transition-all flex items-center gap-1"
        >
          View All
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {products.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 mb-3">
              <PackagePlus className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-white/80">No products added</p>
            <Link 
              href="/admin/products/add" 
              className="mt-3 px-3 py-1.5 bg-[#C52A35]/20 hover:bg-[#C52A35]/30 border border-[#C52A35]/40 text-xs font-medium text-[#ff8a93] rounded-lg transition-colors"
            >
              Add First Product
            </Link>
          </div>
        ) : (
          products.map((product, idx) => (
            <div 
              key={product.id || idx} 
              onClick={() => router.push('/admin/products')}
              className="flex items-center gap-3.5 group p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 border border-white/10">
                <img 
                  src={product.image || '/assets/products.jpg'} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&q=80'
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-sm font-medium truncate group-hover:text-[#ff8a93] transition-colors">
                  {product.name}
                </h3>
                <p className="text-white/40 text-xs truncate mt-0.5">{product.category}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white text-sm font-bold">{product.sales} sold</p>
                {product.revenue ? (
                  <p className="text-emerald-400 text-xs font-mono font-medium">৳{product.revenue.toLocaleString()}</p>
                ) : (
                  <p className="text-white/40 text-[11px]">Sales</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
