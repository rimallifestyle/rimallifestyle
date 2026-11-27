"use client"

import React, { useState, useEffect } from 'react'
import { Package, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { KpiSkeleton, TableSkeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import { StoreWideSaleCard } from '@/components/admin/products/StoreWideSaleCard'

import { fetchWithAuth } from '@/lib/api'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/categories')
        ])
        
        if (prodRes.ok) {
          const data = await prodRes.json()
          setProducts(data)
        }
        
        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(catData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${productToDelete._id || productToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setProducts(products.filter(p => (p._id || p.id) !== (productToDelete._id || productToDelete.id)));
        setProductToDelete(null);
        toast.success("Product deleted successfully");
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error("Error deleting product");
    } finally {
      setIsDeleting(false);
    }
  }

  const handleCopyLink = (product: any) => {
    const url = `http://localhost:3000/product/${product.slug || product._id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(product._id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
        </div>
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Page Header */}
      <ScrollReveal delay={0.1}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Products</h1>
            <p className="text-white/60 text-sm">Manage your store products, pricing, and inventory.</p>
          </div>
          
          <Link href="/admin/products/add">
            <button className="flex items-center gap-2 h-10 px-6 rounded-full bg-[#550000] text-sm font-medium text-white hover:bg-[#7A1111] transition-all shadow-[0_0_15px_rgba(85,0,0,0.5)]">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </Link>
        </div>
      </ScrollReveal>

      {/* Store-Wide Sale Discount Control */}
      <ScrollReveal delay={0.12}>
        <StoreWideSaleCard onSuccess={async () => {
          try {
            const res = await fetch('/api/admin/products');
            if (res.ok) {
              const data = await res.json();
              setProducts(data);
            }
          } catch (e) {
            console.error(e);
          }
        }} />
      </ScrollReveal>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScrollReveal delay={0.15}>
          <KpiCard
            title="Total Products"
            value={products.length.toString()}
            change="Total catalog"
            isPositive={true}
            comparison=""
            icon={<Package className="w-5 h-5" />}
          />
        </ScrollReveal>
        <ScrollReveal delay={0.25}>
          <KpiCard
            title="Active Products"
            value={products.filter(p => p.status === 'publish' || p.status === 'published').length.toString()}
            change={products.length > 0 ? Math.round((products.filter(p => p.status === 'publish' || p.status === 'published').length / products.length) * 100) + '%' : '0%'}
            isPositive={true}
            comparison="of total catalog"
            icon={<Package className="w-5 h-5" />}
          />
        </ScrollReveal>
        <ScrollReveal delay={0.35}>
          <KpiCard
            title="Low Stock items"
            value={products.filter(p => {
              const qty = p.stockQuantity !== undefined ? Number(p.stockQuantity) : Number(p.meta?._rimal_stock ?? 0);
              return qty > 0 && qty < 15;
            }).length.toString()}
            change="Requires action"
            isPositive={false}
            comparison="< 15 units left"
            icon={<Package className="w-5 h-5" />}
          />
        </ScrollReveal>
        <ScrollReveal delay={0.45}>
          <KpiCard
            title="Out of Stock"
            value={products.filter(p => {
              const qty = p.stockQuantity !== undefined ? Number(p.stockQuantity) : Number(p.meta?._rimal_stock ?? 0);
              return p.meta?._rimal_stock_status === 'outofstock' || qty === 0;
            }).length.toString()}
            change="Lost revenue"
            isPositive={false}
            comparison="Restock needed"
            icon={<Package className="w-5 h-5" />}
          />
        </ScrollReveal>
      </div>

      {/* Products Table */}
      <ScrollReveal delay={0.2}>
        <div className="glass-card rounded-3xl p-6 mt-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-medium text-white/90">All Products</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full sm:w-64 h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
              />
            </div>
            <button className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[900px] border-separate" style={{ borderSpacing: '0 4px' }}>
            <thead>
              <tr>
                <th className="pb-3 text-sm font-medium text-white/50 pl-4 border-b border-white/10">Product</th>
                <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">SKU</th>
                <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Category</th>
                <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Price</th>
                <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Stock</th>
                <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Status</th>
                <th className="pb-3 text-sm font-medium text-white/50 text-right pr-4 border-b border-white/10">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="group cursor-pointer">
                  <td className="py-3 pl-4 rounded-l-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                        {product.thumbnail || product.image ? (
                          <img src={product.thumbnail || product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-white/30" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-[#C52A35] transition-colors">{product.name}</p>
                        <p className="text-xs text-white/50">ID: RL-{product._id?.substring(0, 5).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-white/70 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                    {product.sku || 'N/A'}
                  </td>
                  <td className="py-3 text-sm text-white/70 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                    {product.category 
                      ? (categories.find(c => c._id === product.category || c.id === product.category)?.name || product.category) 
                      : 'Uncategorized'}
                  </td>
                  <td className="py-3 font-medium text-white bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                    ৳{product.regularPrice || '0'}
                  </td>
                  <td className="py-3 text-sm text-white/70 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-white">{product.stockQuantity ?? 0}</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-medium",
                        Number(product.stockQuantity) > 0 ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
                      )}>
                        {Number(product.stockQuantity) > 0 ? 'In Stock' : 'Out'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit border",
                      product.status === 'draft' 
                        ? "text-amber-400 bg-amber-400/10 border-amber-400/20" 
                        : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", 
                        product.status === 'draft' ? "bg-amber-400" : "bg-emerald-400"
                      )} />
                      {product.status === 'draft' ? 'Draft' : 'Published'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 rounded-r-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                    <div className="flex items-center justify-end gap-2 relative">
                      <a 
                        href={`http://localhost:3000/product/${product.slug || product._id}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors" 
                        title="View Live Product"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <Link href={`/admin/products/add?id=${product._id}`} onClick={(e) => e.stopPropagation()}>
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-blue-400 transition-colors" title="Edit Product">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setProductToDelete(product); }}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-red-400 transition-colors" 
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="relative group/more">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopyLink(product); }}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                          title="Copy Link"
                        >
                          {copiedId === product._id ? <span className="text-[10px] absolute -top-4 right-0 text-emerald-400 font-bold bg-emerald-400/10 px-2 rounded">Copied!</span> : null}
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-white/50">Showing 1 to {products.length} of {products.length} products</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-md bg-white/5 text-white/50 hover:bg-white/10 text-sm">Prev</button>
            <button className="px-3 py-1 rounded-md bg-[#550000] text-white text-sm">1</button>
            <button className="px-3 py-1 rounded-md bg-white/5 text-white/70 hover:bg-white/10 text-sm">2</button>
            <button className="px-3 py-1 rounded-md bg-white/5 text-white/70 hover:bg-white/10 text-sm">3</button>
            <span className="px-2 text-white/50">...</span>
            <button className="px-3 py-1 rounded-md bg-white/5 text-white/50 hover:bg-white/10 text-sm">Next</button>
          </div>
        </div>
        </div>
      </ScrollReveal>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">Delete Product</h3>
            <p className="text-white/70 mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">{productToDelete.title?.rendered}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 text-sm font-medium transition-colors border border-red-500/30 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
