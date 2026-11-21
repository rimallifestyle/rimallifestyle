"use client"

import React, { useState, useEffect } from 'react'
import { Tag, Plus, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

interface ITag {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<ITag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/tags')
      if (res.ok) {
        const data = await res.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Error loading tags:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return alert('Name is required')
    
    setIsSubmitting(true)
    try {
      const endpoint = editingId ? `/api/admin/tags/${editingId}` : '/api/admin/tags'
      const response = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save tag')

      setFormData({ name: '', slug: '', description: '' })
      setEditingId(null)
      loadTags()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
      console.error('Submission failed', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return

    try {
      await fetch(`/api/admin/tags/${id}`, {
        method: 'DELETE'
      })
      setTags(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      alert('Failed to delete tag')
      console.error('Delete failed', error)
    }
  }

  const handleEdit = (tag: ITag) => {
    setEditingId(tag.id)
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          <div className="lg:col-span-4">
            <div className="glass-card rounded-3xl p-6 h-[400px] animate-pulse bg-white/5" />
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
            <h1 className="text-2xl font-bold text-white mb-1">Tags</h1>
            <p className="text-white/60 text-sm">Use tags to group related products across different categories.</p>
          </div>
          
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 h-10 px-6 rounded-full bg-white/5 text-sm font-medium text-white hover:bg-white/10 border border-white/10 transition-all sm:hidden">
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Add New Tag Form */}
        <div className="lg:col-span-4">
          <ScrollReveal delay={0.2} direction="left">
            <div className="glass-card rounded-3xl p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#C52A35]" />
                  {editingId ? 'Edit Tag' : 'Add New Tag'}
                </h2>
                {editingId && (
                  <button onClick={() => { setEditingId(null); setFormData({name:'',slug:'',description:''}) }} className="text-xs text-white/50 hover:text-white transition-colors">
                    Cancel
                  </button>
                )}
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
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
                  <p className="text-xs text-white/40">The name is how it appears on your site.</p>
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
                  <p className="text-xs text-white/40">Unique URL-friendly name (optional).</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Description</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Write a short description..."
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all custom-scrollbar resize-none"
                  ></textarea>
                  <p className="text-xs text-white/40">The description is not prominent by default.</p>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 h-11 mt-6 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all disabled:opacity-50">
                  <Plus className="w-4 h-4" />
                  {editingId ? 'Update Tag' : 'Add Tag'}
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Side: Tags Table */}
        <div className="lg:col-span-8">
          <ScrollReveal delay={0.3} direction="right">
            <div className="glass-card rounded-3xl p-6">
              <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[700px] border-separate" style={{ borderSpacing: '0 4px' }}>
                  <thead>
                    <tr>
                      <th className="pb-3 text-sm font-medium text-white/50 pl-4 border-b border-white/10">Name</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Slug</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Description</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Count</th>
                      <th className="pb-3 text-sm font-medium text-white/50 text-right pr-4 border-b border-white/10">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tags.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-white/50">No tags found</td>
                      </tr>
                    ) : (
                      tags.map((tag) => (
                        <tr key={tag.id} className="group cursor-pointer">
                          <td className="py-4 pl-4 rounded-l-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                                <Tag className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white group-hover:text-[#C52A35] transition-colors">{tag.name}</p>
                                <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span onClick={() => handleEdit(tag)} className="text-[10px] text-blue-400 hover:underline cursor-pointer">Edit</span>
                                  <span className="text-[10px] text-white/30">|</span>
                                  <span onClick={() => handleDelete(tag.id)} className="text-[10px] text-red-400 hover:underline cursor-pointer">Delete</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-white/70 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            {tag.slug}
                          </td>
                          <td className="py-4 text-sm text-white/70 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent max-w-[200px] truncate">
                            {tag.description}
                          </td>
                          <td className="py-4 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            <div className="inline-flex items-center justify-center min-w-[30px] h-6 px-2 rounded-md bg-white/10 text-xs font-medium text-white/80">
                              {tag.count}
                            </div>
                          </td>
                          <td className="py-4 pr-4 rounded-r-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleEdit(tag)} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-blue-400 transition-colors" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(tag.id)} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-red-400 transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
