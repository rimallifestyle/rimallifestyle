"use client"

import React, { useState, useEffect, useRef } from 'react'
import { ListTree, Plus, Search, Edit, Trash2, Image as ImageIcon, MoreHorizontal, FolderPlus, X, Loader2, AlertTriangle } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { fetchWithAuth, uploadImageToWP } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Category {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent: string;
  count?: number;
  thumbnail?: string;
  meta?: {
    _rimal_category_thumbnail?: string;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent: '0',
    description: '',
    thumbnail: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        const normalized = data.map((c: any) => ({
          ...c,
          id: (c.id || c._id)?.toString(),
          _id: (c._id || c.id)?.toString(),
          parent: (c.parent || c.parentId || '0').toString(),
          count: c.count || 0
        }))
        setCategories(normalized)
      }
    } catch (error) {
      console.error('Failed to load categories', error)
      toast.error('Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "rimal_store/categories");
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data
      });
      const uploadData = await res.json();
      if (!res.ok) throw new Error(uploadData.error || "Upload failed");
      
      setFormData(prev => ({ ...prev, thumbnail: uploadData.url }))
      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Upload failed', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return toast.error('Category name is required')
    
    setIsSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        parent: formData.parent,
        description: formData.description,
        meta: {
          _rimal_category_thumbnail: formData.thumbnail
        }
      }

      const endpoint = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories'
      const response = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to save category')
      }

      toast.success(editingId ? 'Category updated successfully!' : 'Category created successfully!', {
        description: `"${formData.name}" has been saved.`
      })

      resetForm()
      loadCategories()
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Submission failed'}`)
      console.error('Submission failed', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return
    const id = categoryToDelete.id || categoryToDelete._id
    if (!id) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to delete category')
      }
      setCategories(prev => prev.filter(c => c.id !== id && c._id !== id))
      toast.success(`Category "${categoryToDelete.name}" deleted!`, {
        description: "The category was permanently deleted from your store."
      })
      setCategoryToDelete(null)
    } catch (error: any) {
      toast.error('Failed to delete category', {
        description: error.message || 'An error occurred while deleting'
      })
      console.error('Delete failed', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (category: Category) => {
    const id = category.id || category._id
    if (!id) return
    setEditingId(id)
    setFormData({
      name: category.name,
      slug: category.slug,
      parent: category.parent || '0',
      description: category.description || '',
      thumbnail: category.thumbnail || category.meta?._rimal_category_thumbnail || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: '',
      slug: '',
      parent: '0',
      description: '',
      thumbnail: ''
    })
  }

  const getParentName = (parentId: string) => {
    if (!parentId || parentId === '0') return '-'
    const parent = categories.find(c => c.id === parentId || c._id === parentId)
    return parent ? parent.name : '-'
  }

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          <div className="lg:col-span-4">
            <div className="glass-card rounded-3xl p-6 h-[500px] animate-pulse bg-white/5" />
          </div>
          <div className="lg:col-span-8">
            <TableSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Categories</h1>
            <p className="text-white/60 text-sm">Organize your products with hierarchical categories.</p>
          </div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 h-10 px-6 rounded-full bg-white/5 text-sm font-medium text-white hover:bg-white/10 border border-white/10 transition-all sm:hidden">
            <FolderPlus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Add/Edit Form */}
        <div className="lg:col-span-4">
          <ScrollReveal delay={0.2} direction="left">
            <div className="glass-card rounded-3xl p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-[#C52A35]" />
                  {editingId ? 'Edit Category' : 'Add New Category'}
                </h2>
                {editingId && (
                  <button onClick={resetForm} className="text-xs text-white/50 hover:text-white transition-colors">
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Summer Collection" 
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Slug</label>
                  <input 
                    type="text" 
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    placeholder="e.g., summer-collection" 
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Parent Category</label>
                  <select 
                    value={formData.parent}
                    onChange={e => setFormData({...formData, parent: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="0" className="bg-[#1a0505]">None</option>
                    {categories.filter(c => (c.id !== editingId && c._id !== editingId)).map(c => {
                      const cId = c.id || c._id;
                      return (
                        <option key={cId} value={cId} className="bg-[#1a0505]">{c.name}</option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Description</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all custom-scrollbar resize-none"
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Thumbnail</label>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {formData.thumbnail ? (
                    <div className="relative w-full h-32 rounded-xl border border-white/20 overflow-hidden group">
                      <img src={formData.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => setFormData({...formData, thumbnail: ''})} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-colors group"
                    >
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-white/30 group-hover:text-[#C52A35] transition-colors" />
                          <span className="text-xs text-white/50 group-hover:text-white/80">Click to upload image</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || isUploading}
                  className="w-full flex items-center justify-center gap-2 h-11 mt-6 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingId ? (
                    <Edit className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {editingId ? 'Update Category' : 'Add Category'}
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Side: Categories Table */}
        <div className="lg:col-span-8">
          <ScrollReveal delay={0.3} direction="right">
            <div className="glass-card rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative group w-full sm:w-auto">
                  <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search categories..." 
                    className="w-full sm:w-72 h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[600px] border-separate" style={{ borderSpacing: '0 4px' }}>
                  <thead>
                    <tr>
                      <th className="pb-3 text-sm font-medium text-white/50 pl-4 border-b border-white/10">Name</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Slug</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Count</th>
                      <th className="pb-3 text-sm font-medium text-white/50 text-right pr-4 border-b border-white/10">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-white/50 text-sm">
                          No categories found.
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((category) => {
                        const catId = category.id || category._id;
                        return (
                          <tr key={catId} className="group cursor-pointer">
                            <td className="py-4 pl-4 rounded-l-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                                  {category.thumbnail ? (
                                    <img src={category.thumbnail} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <ListTree className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white group-hover:text-[#C52A35] transition-colors flex items-center gap-2">
                                    {category.parent !== '0' && <span className="text-white/30">—</span>}
                                    {category.name}
                                  </p>
                                  {category.parent !== '0' && (
                                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Parent: {getParentName(category.parent)}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-sm text-white/70 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                              <span className="font-mono text-xs text-white/60">{category.slug}</span>
                            </td>
                            <td className="py-4 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                              <div className="inline-flex items-center justify-center min-w-[30px] h-6 px-2 rounded-md bg-white/10 text-xs font-medium text-white/80">
                                {category.count || 0}
                              </div>
                            </td>
                            <td className="py-4 pr-4 rounded-r-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => handleEdit(category)} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-blue-400 transition-colors" title="Edit">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => setCategoryToDelete(category)} className="p-2 rounded-lg hover:bg-red-500/15 text-white/50 hover:text-red-400 transition-colors" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Custom Animated Delete Confirmation Dialog */}
      <AnimatePresence>
        {categoryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setCategoryToDelete(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              className="relative w-full max-w-md bg-[#0F0405] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_0_60px_rgba(197,42,53,0.3)] z-10 overflow-hidden"
            >
              {/* Radial red glow in top corner */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#C52A35]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#C52A35]/15 border border-[#C52A35]/30 flex items-center justify-center flex-shrink-0 text-[#ff4b58] shadow-[0_0_25px_rgba(197,42,53,0.25)]">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Delete Category</h3>
                  <p className="text-sm text-white/50 mt-1">This action cannot be undone.</p>
                </div>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setCategoryToDelete(null)}
                  className="ml-auto p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-6 text-sm text-white/80 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white bg-white/10 px-2.5 py-1 rounded-md border border-white/10 inline-block my-0.5">
                  {categoryToDelete.name}
                </span>
                ? This will permanently remove the category from your catalog.
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setCategoryToDelete(null)}
                  className="px-5 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm font-medium transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="px-5 h-11 rounded-xl bg-gradient-to-r from-[#C52A35] to-[#7A1111] hover:from-[#d9303c] hover:to-[#8f1414] text-white text-sm font-semibold shadow-[0_0_25px_rgba(197,42,53,0.35)] transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Yes, Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
