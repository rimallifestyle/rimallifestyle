import React from 'react'

const products = [
  {
    id: 1,
    name: 'Premium Watch',
    category: 'Accessories',
    sales: 325,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&q=80',
  },
  {
    id: 2,
    name: 'Leather Backpack',
    category: 'Bags',
    sales: 289,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&q=80',
  },
  {
    id: 3,
    name: 'Sneakers Shoes',
    category: 'Footwear',
    sales: 254,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&q=80',
  },
  {
    id: 4,
    name: 'Wireless Headphone',
    category: 'Electronics',
    sales: 198,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80',
  },
  {
    id: 5,
    name: 'Sunglasses',
    category: 'Accessories',
    sales: 165,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=150&q=80',
  },
]

export function TopProducts() {
  return (
    <div className="glass-card rounded-3xl p-6 h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-white/90">Top Products</h2>
        <button className="px-4 py-1.5 rounded-full glass-button text-xs font-medium text-white/80 hover:text-white transition-all">
          View All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-4 group p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white text-sm font-medium truncate group-hover:text-[#C52A35] transition-colors">
                {product.name}
              </h3>
              <p className="text-white/40 text-xs truncate">{product.category}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white text-sm font-bold">{product.sales}</p>
              <p className="text-white/40 text-xs">Sales</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
