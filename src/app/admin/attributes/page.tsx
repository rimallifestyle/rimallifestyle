"use client"

import React, { useState, useEffect } from 'react'
import { Tags, Plus, Search, SlidersHorizontal, Loader2, Trash2 } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { fetchWithAuth } from '@/lib/api'

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [type, setType] = useState('text')
  const [orderBy, setOrderBy] = useState('custom')
  
  // Terms state
  const [selectedAttribute, setSelectedAttribute] = useState<any | null>(null)
  const [terms, setTerms] = useState<any[]>([])
  const [termName, setTermName] = useState('')
  const [termValue, setTermValue] = useState('')
  const [isLoadingTerms, setIsLoadingTerms] = useState(false)

  useEffect(() => {
    loadAttributes()
  }, [])

  const loadAttributes = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/attributes')
      if (res.ok) {
        const data = await res.json()
        setAttributes(data)
      }
    } catch (error) {
      console.error('Error loading attributes:', error)
      setAttributes([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    setIsSaving(true)
    try {
      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        type,
        orderBy,
      }
      
      const res = await fetch('/api/admin/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) throw new Error('Failed to create attribute')
      const newAttr = await res.json()
      
      setAttributes([newAttr, ...attributes])
      setName('')
      setSlug('')
      setType('text')
      setOrderBy('custom')
    } catch (error) {
      console.error('Error saving attribute:', error)
      alert('Failed to save attribute.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAttribute = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attribute?')) return

    try {
      await fetch(`/api/admin/attributes/${id}`, {
        method: 'DELETE'
      })
      setAttributes(attributes.filter(a => a.id !== id))
      if (selectedAttribute?.id === id) {
        setSelectedAttribute(null)
      }
    } catch (error) {
      console.error('Error deleting attribute:', error)
      alert('Failed to delete attribute.')
    }
  }

  const loadTerms = async (attr: any) => {
    setSelectedAttribute(attr)
    setIsLoadingTerms(true)
    try {
      // With our new MongoDB structure, terms are embedded in the attribute.
      // We can just use the attribute's terms array.
      setTerms(attr.terms || [])
    } catch (error) {
      console.error('Error loading terms:', error)
      setTerms([])
    } finally {
      setIsLoadingTerms(false)
    }
  }

  const handleAddTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termName || !selectedAttribute) return

    try {
      const payload = {
        action: 'add_term',
        term: {
          name: termName,
          value: selectedAttribute.type === 'color' && !termValue ? '#000000' : termValue
        }
      }
      const res = await fetch(`/api/admin/attributes/${selectedAttribute.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to add term')
      
      const updatedTerms = await res.json()
      setTerms(updatedTerms)
      
      // Update the main attributes state so UI reflects it
      setAttributes(attributes.map(a => a.id === selectedAttribute.id ? { ...a, terms: updatedTerms } : a))
      setSelectedAttribute({ ...selectedAttribute, terms: updatedTerms })

      setTermName('')
      setTermValue(selectedAttribute.type === 'color' ? '#000000' : '')
    } catch (error) {
      console.error('Error saving term:', error)
      alert('Failed to save term.')
    }
  }

  const handleDeleteTerm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this term?')) return
    if (!selectedAttribute) return
    try {
      const payload = {
        action: 'delete_term',
        termId: id
      }
      const res = await fetch(`/api/admin/attributes/${selectedAttribute.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to delete term')
        
      const updatedTerms = await res.json()
      setTerms(updatedTerms)
      setAttributes(attributes.map(a => a.id === selectedAttribute.id ? { ...a, terms: updatedTerms } : a))
      setSelectedAttribute({ ...selectedAttribute, terms: updatedTerms })
    } catch (error) {
      console.error('Error deleting term:', error)
    }
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
            <div className="glass-card rounded-3xl p-6 h-[450px] animate-pulse bg-white/5" />
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
      {/* Page Header */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Attributes</h1>
            <p className="text-white/60 text-sm">Create global attributes like size or color for product variations.</p>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Content Grid: Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Add New Attribute Form */}
        <div className="lg:col-span-4">
          <ScrollReveal delay={0.2} direction="left">
            <div className="glass-card rounded-3xl p-6 sticky top-6">
              <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <Tags className="w-5 h-5 text-[#C52A35]" />
                Add New Attribute
              </h2>

              <form className="space-y-4" onSubmit={handleAddAttribute}>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Size" 
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all"
                    required
                  />
                  <p className="text-xs text-white/40">Name for the attribute (shown on the frontend).</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Slug</label>
                  <input 
                    type="text" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g., size" 
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all"
                  />
                  <p className="text-xs text-white/40">Unique URL-friendly name (optional).</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="text" className="bg-[#1a0505]">Text (e.g. Size)</option>
                    <option value="color" className="bg-[#1a0505]">Color (Color Picker)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Default sort order</label>
                  <select 
                    value={orderBy}
                    onChange={(e) => setOrderBy(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="custom" className="bg-[#1a0505]">Custom ordering</option>
                    <option value="name" className="bg-[#1a0505]">Name</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={isSaving || !name}
                  className="w-full flex items-center justify-center gap-2 h-11 mt-6 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Attribute
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Side: Attributes Table */}
        <div className="lg:col-span-8">
          <ScrollReveal delay={0.3} direction="right">
            <div className="glass-card rounded-3xl p-6">
              
              <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[700px] border-separate" style={{ borderSpacing: '0 4px' }}>
                  <thead>
                    <tr>
                      <th className="pb-3 text-sm font-medium text-white/50 pl-4 border-b border-white/10">Name</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Slug</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Type</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Order By</th>
                      <th className="pb-3 text-sm font-medium text-white/50 text-right pr-4 border-b border-white/10">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attributes.length === 0 ? (
                       <tr>
                         <td colSpan={4} className="py-8 text-center text-white/50 bg-white/5 rounded-xl">
                           No attributes found.
                         </td>
                       </tr>
                    ) : (
                      attributes.map((attr) => (
                        <tr key={attr.id} className="group cursor-pointer">
                          <td className="py-4 pl-4 rounded-l-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                                <SlidersHorizontal className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white group-hover:text-[#C52A35] transition-colors">{attr.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-white/70 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            {attr.slug}
                          </td>
                          <td className="py-4 text-sm text-white/70 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            <span className="capitalize">{attr.type || 'text'}</span>
                          </td>
                          <td className="py-4 text-sm text-white/70 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            {attr.orderBy}
                          </td>
                          <td className="py-4 pr-4 rounded-r-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); loadTerms(attr); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-xs font-medium border border-white/10"
                              >
                                Configure Terms
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteAttribute(attr.id); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors text-xs font-medium border border-red-500/20"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          
          {/* Configure Terms Panel */}
          {selectedAttribute && (
            <ScrollReveal delay={0.4} direction="up">
              <div className="glass-card rounded-3xl p-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-white">
                    Terms for <span className="text-[#C52A35]">{selectedAttribute.name}</span>
                  </h2>
                  <button onClick={() => setSelectedAttribute(null)} className="text-xs text-white/50 hover:text-white">Close</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <form className="space-y-4" onSubmit={handleAddTerm}>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-white/80">Name</label>
                        <input 
                          type="text" 
                          value={termName}
                          onChange={(e) => setTermName(e.target.value)}
                          placeholder={selectedAttribute.type === 'color' ? "e.g. Red" : "e.g. XL"} 
                          className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10"
                          required
                        />
                      </div>
                      
                      {selectedAttribute.type === 'color' && (
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-white/80">Color Code</label>
                          <div className="flex gap-3">
                            <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-white/20 flex-shrink-0 cursor-pointer">
                              <input 
                                type="color" 
                                value={termValue || '#000000'}
                                onChange={(e) => setTermValue(e.target.value)}
                                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                              />
                            </div>
                            <input 
                              type="text" 
                              value={termValue}
                              onChange={(e) => setTermValue(e.target.value)}
                              placeholder="#000000" 
                              className="flex-1 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50"
                            />
                          </div>
                        </div>
                      )}
                      
                      <button 
                        type="submit" 
                        disabled={!termName}
                        className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Term
                      </button>
                    </form>
                  </div>
                  
                  <div className="md:col-span-2">
                    {isLoadingTerms ? (
                      <div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {terms.length === 0 ? (
                          <div className="text-white/40 text-sm py-4">No terms created yet.</div>
                        ) : (
                          terms.map((term) => (
                            <div key={term._id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 group">
                              {selectedAttribute.type === 'color' && term.value && (
                                <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: term.value }}></span>
                              )}
                              <span className="text-sm text-white/80">{term.name}</span>
                              <button onClick={() => handleDeleteTerm(term._id)} className="text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </div>
  )
}
