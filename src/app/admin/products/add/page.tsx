"use client"

import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Upload, Save, ImagePlus, CheckCircle2, Plus, FolderPlus, Loader2, X, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { fetchWithAuth, uploadImageToWP } from '@/lib/api'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function AddProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  
  const [categories, setCategories] = useState<any[]>([])
  
  // Form State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [regularPrice, setRegularPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [sku, setSku] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')
  const [category, setCategory] = useState('')
  const [parentCategory, setParentCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [isAddingSub, setIsAddingSub] = useState(false)
  const [newSubName, setNewSubName] = useState('')
  const [isCreatingSub, setIsCreatingSub] = useState(false)
  
  // Attributes State
  const [globalAttributes, setGlobalAttributes] = useState<any[]>([])
  const [productAttributes, setProductAttributes] = useState<{id?: number, name: string, slug: string, type?: string, options: string[], allTerms?: any[]}[]>([])
  
  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Gallery Images State
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        let loadedCats: any[] = []
        // Fetch categories from new API
        const catRes = await fetch('/api/admin/categories')
        if (catRes.ok) {
          const rawCats = await catRes.json()
          loadedCats = Array.isArray(rawCats) ? rawCats.map((c: any) => ({
            ...c,
            _id: (c._id || c.id)?.toString(),
            id: (c.id || c._id)?.toString(),
            parent: (c.parent || c.parentId || '0')?.toString()
          })) : []
          setCategories(loadedCats)
        } else {
          console.error('Failed to load categories', catRes.status)
        }
        
        // Fetch attributes from new API
        const attrRes = await fetch('/api/admin/attributes')
        if (attrRes.ok) {
          const attrData = await attrRes.json()
          setGlobalAttributes(Array.isArray(attrData) ? attrData : [])
        }
        
        // Load product if editing
        if (editId) {
          const productRes = await fetch(`/api/admin/products/${editId}`)
          if (productRes.ok) {
            const product = await productRes.json()
            setName(product.name || '')
            setDescription(product.description || '')
            setRegularPrice(product.regularPrice?.toString() || '')
            setSalePrice(product.salePrice?.toString() || '')
            setSku(product.sku || '')
            setStockQuantity(product.stockQuantity?.toString() || '')
            
            if (product.category) {
              const catRaw = product.category.toString().trim()
              const foundCat = loadedCats.find((c: any) => 
                (c._id && c._id === catRaw) ||
                (c.id && c.id === catRaw) ||
                (c.slug && c.slug.toLowerCase() === catRaw.toLowerCase()) ||
                (c.name && c.name.toLowerCase() === catRaw.toLowerCase())
              )
              if (foundCat) {
                const foundId = (foundCat._id || foundCat.id).toString()
                const pId = (foundCat.parent || foundCat.parentId)?.toString()
                if (pId && pId !== '0') {
                  setParentCategory(pId)
                  setSubCategory(foundId)
                  setCategory(foundId)
                } else {
                  setParentCategory(foundId)
                  setSubCategory('')
                  setCategory(foundId)
                }
              } else {
                setCategory(catRaw)
                setParentCategory(product.parentCategory?.toString() || catRaw)
                setSubCategory(product.subCategory?.toString() || '')
              }
            } else if (product.parentCategory) {
              const pRaw = product.parentCategory.toString().trim()
              const matchedParent = loadedCats.find((c: any) => 
                (c._id && c._id === pRaw) ||
                (c.id && c.id === pRaw) ||
                (c.slug && c.slug.toLowerCase() === pRaw.toLowerCase()) ||
                (c.name && c.name.toLowerCase() === pRaw.toLowerCase())
              )
              const pId = matchedParent ? (matchedParent._id || matchedParent.id).toString() : pRaw
              setParentCategory(pId)

              if (product.subCategory) {
                const sRaw = product.subCategory.toString().trim()
                const matchedSub = loadedCats.find((c: any) => 
                  (c._id && c._id === sRaw) ||
                  (c.id && c.id === sRaw) ||
                  (c.slug && c.slug.toLowerCase() === sRaw.toLowerCase()) ||
                  (c.name && c.name.toLowerCase() === sRaw.toLowerCase())
                )
                const sId = matchedSub ? (matchedSub._id || matchedSub.id).toString() : sRaw
                setSubCategory(sId)
                setCategory(sId)
              } else {
                setCategory(pId)
              }
            }
            
            if (product.image) {
              setImagePreview(product.image)
            }
            
            if (product.gallery && Array.isArray(product.gallery)) {
              setGalleryPreviews(product.gallery)
            }
            
            if (product.productAttributes && Array.isArray(product.productAttributes)) {
              setProductAttributes(product.productAttributes)
            } else if (product.attributes && Array.isArray(product.attributes)) {
              setProductAttributes(product.attributes) // Fallback for old data
            }
          }
        }
      } catch (err) {
        console.error('Failed to load data', err)
      }
    }
    loadData()
  }, [editId])

  const parentCategories = categories.filter((c: any) => {
    const p = (c.parent || c.parentId)?.toString()?.trim();
    return !p || p === '0' || p === 'null' || p === 'undefined';
  });

  const availableSubcategories = categories.filter((c: any) => {
    if (!parentCategory) return false;
    const cParent = (c.parent || c.parentId)?.toString()?.trim();
    if (!cParent || cParent === '0' || cParent === 'null' || cParent === 'undefined') return false;

    const pId = parentCategory.toString().trim();
    if (cParent === pId) return true;

    const selParent = categories.find((cat: any) => {
      const catId = (cat._id || cat.id)?.toString()?.trim();
      return catId === pId || cat.slug?.toLowerCase() === pId.toLowerCase() || cat.name?.toLowerCase() === pId.toLowerCase();
    });

    if (selParent) {
      const sId = (selParent._id || selParent.id)?.toString()?.trim();
      if (sId && cParent === sId) return true;
      if (selParent.slug && cParent.toLowerCase() === selParent.slug.toLowerCase()) return true;
      if (selParent.name && cParent.toLowerCase() === selParent.name.toLowerCase()) return true;
    }

    return false;
  });

  const handleQuickCreateSub = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubName.trim() || !parentCategory) {
      toast.error('Please enter subcategory name and select parent category');
      return;
    }
    setIsCreatingSub(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubName.trim(),
          parent: parentCategory
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create subcategory');
      }
      const created = await res.json();
      const normalizedCreated = {
        ...created,
        _id: (created._id || created.id)?.toString(),
        id: (created.id || created._id)?.toString(),
        parent: parentCategory.toString()
      };
      setCategories(prev => [...prev, normalizedCreated]);
      const newId = normalizedCreated._id;
      setSubCategory(newId);
      setCategory(newId);
      setNewSubName('');
      setIsAddingSub(false);
      toast.success(`Subcategory "${normalizedCreated.name}" created & selected!`);
    } catch (err: any) {
      toast.error(err.message || 'Error creating subcategory');
    } finally {
      setIsCreatingSub(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setGalleryFiles([...galleryFiles, ...files])
      
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setGalleryPreviews([...galleryPreviews, ...newPreviews])
    }
  }

  const removeGalleryImage = (index: number) => {
    const newFiles = [...galleryFiles]
    newFiles.splice(index, 1)
    setGalleryFiles(newFiles)
    
    const newPreviews = [...galleryPreviews]
    newPreviews.splice(index, 1)
    setGalleryPreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent, status: 'published' | 'draft' = 'published') => {
    e.preventDefault()
    if (!name || !regularPrice) {
      toast.error('Product Name and Regular Price are required.')
      return
    }

    setIsSubmitting(true)

    try {
      const uploadImageToCloudinary = async (file: File) => {
        const data = new FormData();
        data.append("file", file);
        data.append("folder", "rimal_store/products");
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: data
        });
        const uploadData = await res.json();
        if (!res.ok) throw new Error(uploadData.error || "Upload failed");
        return uploadData.url;
      }

      let imageUrl = imagePreview && !imagePreview.startsWith('blob:') ? imagePreview : null
      
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile)
      }
      
      let galleryUrls: string[] = galleryPreviews.filter(url => !url.startsWith('blob:'))
      if (galleryFiles.length > 0) {
        for (const file of galleryFiles) {
          const url = await uploadImageToCloudinary(file)
          galleryUrls.push(url)
        }
      }

      // 2. Prepare Product Data (MongoDB Format)
      const finalCategory = subCategory || parentCategory || category
      const productData = {
        name,
        description,
        regularPrice,
        salePrice: salePrice || undefined,
        sku,
        stockQuantity: stockQuantity ? parseInt(stockQuantity, 10) : 0,
        category: finalCategory,
        parentCategory: parentCategory || undefined,
        subCategory: subCategory || undefined,
        image: imageUrl,
        gallery: galleryUrls.length > 0 ? galleryUrls : undefined,
        productAttributes,
        globalAttributes,
        status
      }

      // 3. Create or Update Product via Next.js API
      const endpoint = editId ? `/api/admin/products/${editId}` : '/api/admin/products'
      const res = await fetch(endpoint, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save product')

      toast.success(`Product ${editId ? 'updated' : 'created'} successfully!`)
      
      // Optional: Redirect after success
      setTimeout(() => {
        router.push('/admin/products')
      }, 1000)
      
    } catch (err: any) {
      toast.error(err.message || 'Failed to create product.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6 pt-4 pb-6" onSubmit={(e) => handleSubmit(e, 'published')}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <button type="button" className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{editId ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="text-white/60 text-sm">{editId ? 'Update your product listing details.' : 'Create a new product listing for your store.'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={isSubmitting}
            className="flex items-center gap-2 h-10 px-6 rounded-full glass-button text-sm font-medium text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Save as Draft
          </button>
          <button 
            type="submit" 
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={isSubmitting}
            className="flex items-center gap-2 h-10 px-6 rounded-full bg-[#550000] text-sm font-medium text-white hover:bg-[#7A1111] transition-all shadow-[0_0_15px_rgba(85,0,0,0.5)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? 'Saving...' : (editId ? 'Update Product' : 'Publish Product')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* General Information */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-lg font-medium text-white/90 mb-6">General Information</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Product Name <span className="text-[#C52A35]">*</span></label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium Wireless Headphones" 
                  required
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
                <textarea 
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product..." 
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all resize-none custom-scrollbar"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-lg font-medium text-white/90 mb-6">Pricing & Inventory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Regular Price (৳) <span className="text-[#C52A35]">*</span></label>
                <input 
                  type="number" 
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  placeholder="0.00" 
                  required
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Sale Price (৳)</label>
                <input 
                  type="number" 
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="0.00" 
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">SKU (Stock Keeping Unit)</label>
                <input 
                  type="text" 
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. PRD-001" 
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Stock Quantity</label>
                <input 
                  type="number" 
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="0 (leave empty for unlimited)" 
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-white/90">Attributes</h2>
              <div className="flex gap-2">
                <select 
                  className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:bg-white/10"
                  onChange={(e) => {
                    if(!e.target.value) return;
                    const attr = globalAttributes.find(a => a.slug === e.target.value);
                    if (attr && !productAttributes.find(pa => pa.slug === attr.slug)) {
                      setProductAttributes([...productAttributes, { 
                        id: attr.id || attr._id, 
                        name: attr.name, 
                        slug: attr.slug, 
                        type: attr.type,
                        options: [],
                        allTerms: attr.terms || []
                      }]);
                    }
                    e.target.value = '';
                  }}
                >
                  <option value="" className="bg-[#1a0505]">Add existing...</option>
                  {globalAttributes.map(a => (
                    <option key={a.slug} value={a.slug} className="bg-[#1a0505]">{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {productAttributes.map((attr, index) => (
                <div key={attr.slug} className="p-4 rounded-xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">{attr.name}</span>
                    <button 
                      type="button"
                      onClick={() => setProductAttributes(productAttributes.filter(a => a.slug !== attr.slug))}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {attr.allTerms && attr.allTerms.length > 0 ? (
                      attr.allTerms.map((term: any) => {
                        const isSelected = attr.options.includes(term.name);
                        return (
                          <label 
                            key={term._id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                              isSelected ? 'bg-[#C52A35]/20 border-[#C52A35]' : 'bg-black/20 border-white/5 hover:border-white/20'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              className="hidden"
                              checked={isSelected}
                              onChange={(e) => {
                                const newAttrs = [...productAttributes];
                                const updatedAttr = { ...newAttrs[index] };
                                updatedAttr.options = [...updatedAttr.options];
                                
                                if (e.target.checked) {
                                  updatedAttr.options.push(term.name);
                                } else {
                                  updatedAttr.options = updatedAttr.options.filter(o => o !== term.name);
                                }
                                
                                newAttrs[index] = updatedAttr;
                                setProductAttributes(newAttrs);
                              }}
                            />
                            {attr.type === 'color' && term.meta_value && (
                              <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: term.meta_value }}></span>
                            )}
                            <span className={`text-sm ${isSelected ? 'text-white' : 'text-white/70'}`}>{term.name}</span>
                          </label>
                        )
                      })
                    ) : (
                      <span className="text-sm text-white/40">No terms configured for this attribute yet. Go to Attributes menu to add them.</span>
                    )}
                  </div>
                </div>
              ))}
              {productAttributes.length === 0 && (
                <div className="text-sm text-white/40 text-center py-4 border border-dashed border-white/10 rounded-xl">
                  No attributes added yet. Select one from the dropdown above.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="flex flex-col gap-6">
          
          {/* Media */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-lg font-medium text-white/90 mb-6">Product Image</h2>
            
            <input 
              type="file" 
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden" 
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all group overflow-hidden relative"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImagePlus className="w-6 h-6 text-white mb-2" />
                    <span className="text-white text-sm font-medium">Replace Image</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImagePlus className="w-6 h-6 text-white/70" />
                  </div>
                  <div className="text-center p-2">
                    <p className="text-sm font-medium text-white">Click to upload featured image</p>
                    <p className="text-xs text-white/40 mt-1">PNG, JPG or WEBP (Max 2MB)</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white/90">Gallery Images</h3>
                <button 
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="text-xs text-gold hover:text-white transition-colors"
                >
                  Add Images
                </button>
              </div>
              
              <input 
                type="file" 
                accept="image/*"
                multiple
                ref={galleryInputRef}
                onChange={handleGalleryChange}
                className="hidden" 
              />
              
              <div className="grid grid-cols-3 gap-3">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-xl border border-white/10 bg-white/5 overflow-hidden group">
                    <img src={preview} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <Plus className="w-4 h-4 text-white rotate-45" />
                    </button>
                  </div>
                ))}
                
                <div 
                  onClick={() => galleryInputRef.current?.click()}
                  className="aspect-square rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImagePlus className="w-4 h-4 text-white/70" />
                  </div>
                  <span className="text-[10px] text-white/50 font-medium">Add Image</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-medium text-white/90 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#C52A35]" />
                Product Categories
              </h2>
              {parentCategory && (
                <span className="text-[11px] font-medium text-[#ff7882] bg-[#C52A35]/15 px-2.5 py-0.5 rounded-full border border-[#C52A35]/30">
                  {subCategory ? 'Subcategory Selected' : 'Parent Selected'}
                </span>
              )}
            </div>
            
            <div className="space-y-5">
              {/* 1. Parent Category Selector */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Parent Category <span className="text-red-400">*</span>
                </label>

                {/* Quick Parent Category Pills */}
                {parentCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {parentCategories.map((parent: any) => {
                      const pId = (parent._id || parent.id)?.toString();
                      const isSelected = parentCategory === pId;
                      const subCount = categories.filter((c: any) => {
                        const cP = (c.parent || c.parentId)?.toString();
                        return cP === pId;
                      }).length;

                      return (
                        <button
                          key={pId}
                          type="button"
                          onClick={() => {
                            setParentCategory(pId);
                            setSubCategory('');
                            setCategory(pId);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#C52A35] to-[#7A1111] text-white border border-[#C52A35] shadow-[0_0_15px_rgba(197,42,53,0.4)]'
                              : 'bg-white/5 text-white/80 hover:text-white hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          <span>{parent.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'}`}>
                            {subCount} sub
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Parent Select Dropdown */}
                <div className="relative">
                  <select 
                    className="w-full h-11 px-4 pr-10 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:border-[#C52A35]/50 transition-all appearance-none cursor-pointer"
                    value={parentCategory}
                    onChange={(e) => {
                      const newParentId = e.target.value;
                      setParentCategory(newParentId);
                      setSubCategory('');
                      setCategory(newParentId);
                    }}
                  >
                    <option value="" disabled style={{ backgroundColor: '#140305', color: '#888888' }}>
                      Select parent category...
                    </option>
                    {parentCategories.map((parent: any) => {
                      const pId = (parent._id || parent.id)?.toString();
                      return (
                        <option key={pId} value={pId} style={{ backgroundColor: '#140305', color: '#ffffff' }}>
                          {parent.name}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              {/* 2. Subcategory Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white/80">
                    Subcategory <span className="text-xs text-white/40 font-normal">(Optional)</span>
                  </label>
                  {parentCategory && (
                    <button
                      type="button"
                      onClick={() => setIsAddingSub(!isAddingSub)}
                      className="text-xs text-[#ff7882] hover:text-white transition-colors flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isAddingSub ? 'Cancel' : 'Quick Add Subcategory'}
                    </button>
                  )}
                </div>

                {/* Inline Quick Add Subcategory Form */}
                {parentCategory && isAddingSub && (
                  <div className="mb-3 p-3.5 rounded-2xl bg-[#C52A35]/10 border border-[#C52A35]/30">
                    <p className="text-xs text-white/80 mb-2 font-medium">
                      Add subcategory under: <span className="text-[#ff7882] font-semibold">{parentCategories.find((p: any) => (p._id || p.id)?.toString() === parentCategory)?.name}</span>
                    </p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQuickCreateSub();
                          }
                        }}
                        placeholder="e.g. Polo, T-Shirt, Panjabi..." 
                        className="flex-1 h-9 px-3 rounded-lg bg-black/40 border border-white/20 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#C52A35]"
                      />
                      <button
                        type="button"
                        disabled={isCreatingSub || !newSubName.trim()}
                        onClick={() => handleQuickCreateSub()}
                        className="h-9 px-3.5 rounded-lg bg-[#C52A35] hover:bg-[#a52029] text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isCreatingSub ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Add & Select
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Subcategory Select Dropdown */}
                <div className="relative">
                  <select 
                    disabled={!parentCategory || availableSubcategories.length === 0}
                    className="w-full h-11 px-4 pr-10 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:border-[#C52A35]/50 transition-all appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    value={subCategory}
                    onChange={(e) => {
                      const newSubId = e.target.value;
                      setSubCategory(newSubId);
                      setCategory(newSubId || parentCategory);
                    }}
                  >
                    {!parentCategory ? (
                      <option value="" style={{ backgroundColor: '#140305', color: '#888888' }}>
                        Select a parent category first...
                      </option>
                    ) : availableSubcategories.length === 0 ? (
                      <option value="" style={{ backgroundColor: '#140305', color: '#888888' }}>
                        No subcategories under this parent (use Quick Add above)
                      </option>
                    ) : (
                      <>
                        <option value="" style={{ backgroundColor: '#140305', color: '#ffffff' }}>
                          None (Assign to main category)
                        </option>
                        {availableSubcategories.map((sub: any) => {
                          const subId = (sub._id || sub.id)?.toString();
                          return (
                            <option key={subId} value={subId} style={{ backgroundColor: '#140305', color: '#ffffff' }}>
                              ↳ {sub.name}
                            </option>
                          );
                        })}
                      </>
                    )}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>

                {/* Interactive Clickable Subcategory Pills/Chips */}
                {parentCategory && availableSubcategories.length > 0 && (
                  <div className="mt-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                    <p className="text-[11px] text-white/50 mb-2 font-medium flex items-center justify-between">
                      <span>Click to select subcategory:</span>
                      {subCategory && (
                        <button
                          type="button"
                          onClick={() => {
                            setSubCategory('');
                            setCategory(parentCategory);
                          }}
                          className="text-[10px] text-white/40 hover:text-white underline cursor-pointer"
                        >
                          Clear subcategory
                        </button>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSubCategory('');
                          setCategory(parentCategory);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          !subCategory
                            ? 'bg-white/20 text-white border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        <span>✦</span> Main Category Only
                      </button>

                      {availableSubcategories.map((sub: any) => {
                        const subId = (sub._id || sub.id)?.toString();
                        const isSelected = subCategory === subId;
                        return (
                          <button
                            key={subId}
                            type="button"
                            onClick={() => {
                              setSubCategory(subId);
                              setCategory(subId);
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-[#C52A35] to-[#7A1111] text-white border border-[#C52A35] shadow-[0_0_20px_rgba(197,42,53,0.45)]'
                                : 'bg-white/5 text-white/80 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20'
                            }`}
                          >
                            <span>↳</span> {sub.name}
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* If no subcategories found, show helpful callout */}
                {parentCategory && availableSubcategories.length === 0 && !isAddingSub && (
                  <div className="mt-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/50">No subcategories under this parent yet.</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingSub(true)}
                      className="text-[#ff7882] hover:text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add One Now
                    </button>
                  </div>
                )}

                {/* Current Selection Summary */}
                {parentCategory && (
                  <div className="mt-3 text-xs text-white/70 flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">Assigned:</span>
                      <span className="font-semibold text-white">
                        {(() => {
                          const parent = parentCategories.find((p: any) => (p._id || p.id)?.toString() === parentCategory);
                          const parentName = parent ? parent.name : 'Category';
                          if (subCategory) {
                            const sub = availableSubcategories.find((s: any) => (s._id || s.id)?.toString() === subCategory);
                            return `${parentName} › ${sub ? sub.name : 'Subcategory'}`;
                          }
                          return `${parentName} (Main Category)`;
                        })()}
                      </span>
                    </div>
                    {(parentCategory || subCategory) && (
                      <button
                        type="button"
                        onClick={() => {
                          setParentCategory('');
                          setSubCategory('');
                          setCategory('');
                        }}
                        className="text-[10px] text-white/40 hover:text-white underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  )
}
