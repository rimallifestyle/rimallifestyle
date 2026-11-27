"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  Check,
  Globe,
  Layers,
  Sparkles,
  Shield,
  ShoppingCart,
  Home,
  User,
  ShoppingBag,
  Info,
  Phone,
  Loader2,
  X,
  CheckCircle2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PageItem {
  id: string
  title: string
  slug: string
  type: string
  status: string
  isCore?: boolean
  isCustom?: boolean
  editUrl?: string
  updatedAt?: string
  description?: string
  content?: string
}

function PagesContent() {
  const searchParams = useSearchParams()
  const actionParam = searchParams.get('action')

  const [pages, setPages] = useState<PageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'core' | 'policy' | 'custom'>('all')
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(actionParam === 'add')
  const [editingPage, setEditingPage] = useState<PageItem | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formType, setFormType] = useState('Content Page')
  const [formContent, setFormContent] = useState('')
  const [formStatus, setFormStatus] = useState('published')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadPages = async () => {
    try {
      const res = await fetch('/api/admin/pages')
      if (res.ok) {
        const data = await res.json()
        setPages(data)
      }
    } catch (err) {
      console.error('Failed to load pages:', err)
      toast.error('Failed to load pages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPages()
  }, [])

  useEffect(() => {
    if (actionParam === 'add') {
      handleOpenCreateModal()
    }
  }, [actionParam])

  const handleCopyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}${slug}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedSlug(slug)
    toast.success('Page link copied to clipboard!')
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const handleOpenCreateModal = () => {
    setEditingPage(null)
    setFormTitle('')
    setFormSlug('')
    setFormType('Content Page')
    setFormContent('')
    setFormStatus('published')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (page: PageItem) => {
    setEditingPage(page)
    setFormTitle(page.title)
    setFormSlug(page.slug.replace(/^\//, ''))
    setFormType(page.type || 'Content Page')
    setFormContent(page.content || page.description || '')
    setFormStatus(page.status || 'published')
    setIsModalOpen(true)
  }

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      toast.error('Page title is required')
      return
    }

    setSubmitting(true)
    try {
      const method = editingPage ? 'PUT' : 'POST'
      const payload: any = {
        title: formTitle.trim(),
        slug: formSlug.trim() ? `/${formSlug.trim().replace(/^\/+/, '')}` : undefined,
        type: formType,
        content: formContent,
        status: formStatus
      }

      if (editingPage) {
        payload.id = editingPage.id
      }

      const res = await fetch('/api/admin/pages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error()

      toast.success(editingPage ? `Page "${formTitle}" updated!` : `Page "${formTitle}" created!`)
      setIsModalOpen(false)
      loadPages()
    } catch {
      toast.error('Failed to save page')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePage = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the "${title}" page?`)) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/pages?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()

      toast.success(`Page "${title}" deleted`)
      setPages(prev => prev.filter(p => p.id !== id))
    } catch {
      toast.error('Failed to delete page')
    } finally {
      setDeletingId(null)
    }
  }

  // Get icon by page type
  const getPageIcon = (type: string, slug: string) => {
    if (slug === '/') return Home
    if (slug === '/shop') return ShoppingBag
    if (slug === '/cart') return ShoppingCart
    if (slug === '/checkout') return CheckCircle2
    if (slug === '/account') return User
    if (slug === '/about') return Info
    if (slug === '/contact') return Phone
    if (slug.includes('policy') || slug.includes('terms')) return Shield
    return FileText
  }

  // Filtered pages
  const filteredPages = pages.filter(p => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const match = p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)
      if (!match) return false
    }

    // Tab filter
    if (activeTab === 'core') return p.isCore
    if (activeTab === 'policy') return p.type === 'Policy Page'
    if (activeTab === 'custom') return p.isCustom
    return true
  })

  const coreCount = pages.filter(p => p.isCore).length
  const policyCount = pages.filter(p => p.type === 'Policy Page').length
  const customCount = pages.filter(p => p.isCustom).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#C52A35] animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] p-4 md:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#7A1111] to-[#550000] border border-white/10 shadow-[0_0_20px_rgba(122,17,17,0.4)]">
              <FileText className="w-6 h-6 text-white" />
            </div>
            Pages
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Manage all storefront pages, templates, policies, and custom content
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-white text-xs font-semibold hover:shadow-[0_0_20px_rgba(197,42,53,0.4)] transition-all cursor-pointer shadow-md hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Page</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-white/10 bg-white/[0.02]">
          <p className="text-white/40 text-xs uppercase font-medium tracking-wider">Total Pages</p>
          <p className="text-2xl font-bold text-white mt-1">{pages.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-white/10 bg-white/[0.02]">
          <p className="text-white/40 text-xs uppercase font-medium tracking-wider">Core Store Pages</p>
          <p className="text-2xl font-bold text-gold mt-1">{coreCount}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-white/10 bg-white/[0.02]">
          <p className="text-white/40 text-xs uppercase font-medium tracking-wider">Policies & Legal</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{policyCount}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-white/10 bg-white/[0.02]">
          <p className="text-white/40 text-xs uppercase font-medium tracking-wider">Custom Pages</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{customCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTab === 'all' ? "bg-white/15 text-white shadow-sm font-semibold" : "text-white/60 hover:text-white"
            )}
          >
            All ({pages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('core')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTab === 'core' ? "bg-white/15 text-white shadow-sm font-semibold" : "text-white/60 hover:text-white"
            )}
          >
            Core Pages ({coreCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('policy')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTab === 'policy' ? "bg-white/15 text-white shadow-sm font-semibold" : "text-white/60 hover:text-white"
            )}
          >
            Policies ({policyCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTab === 'custom' ? "bg-white/15 text-white shadow-sm font-semibold" : "text-white/60 hover:text-white"
            )}
          >
            Custom Pages ({customCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages by title or slug..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-gold transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Pages Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
                <th className="py-3.5 px-4 font-semibold">Title</th>
                <th className="py-3.5 px-4 font-semibold">URL / Slug</th>
                <th className="py-3.5 px-4 font-semibold">Type</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Author</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredPages.map((page) => {
                const PageIcon = getPageIcon(page.type, page.slug)

                return (
                  <tr key={page.id} className="hover:bg-white/[0.03] transition-colors group">
                    {/* Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-gold/50 group-hover:bg-gold/10 transition-colors">
                          <PageIcon className="w-4 h-4 text-gold" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white group-hover:text-gold transition-colors">
                              {page.title}
                            </span>
                            {page.isCore && (
                              <span className="text-[10px] bg-gold/10 text-gold px-1.5 py-0.2 rounded border border-gold/20 font-medium">
                                Core
                              </span>
                            )}
                          </div>
                          {page.description && (
                            <p className="text-[11px] text-white/40 truncate max-w-sm">
                              {page.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* URL / Slug */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-white/70 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {page.slug}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(page.slug)}
                          title="Copy Link"
                          className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          {copiedSlug === page.slug ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-white/60">
                        {page.type}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                        <span className="text-xs font-medium text-emerald-400 capitalize">
                          {page.status}
                        </span>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="py-3.5 px-4 text-xs text-white/50">
                      Rimal Atelier
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View in Storefront */}
                        <a
                          href={page.slug}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View</span>
                        </a>

                        {/* Edit / Configure */}
                        {page.editUrl ? (
                          <Link
                            href={page.editUrl}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#7A1111]/80 hover:bg-[#9A1515] text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(page)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#7A1111]/80 hover:bg-[#9A1515] text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}

                        {/* Delete for custom pages */}
                        {page.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeletePage(page.id, page.title)}
                            disabled={deletingId === page.id}
                            title="Delete custom page"
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
                          >
                            {deletingId === page.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredPages.length === 0 && (
          <div className="py-12 text-center text-white/50 space-y-2">
            <FileText className="w-8 h-8 mx-auto opacity-30" />
            <p className="text-sm">No pages found matching &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Add / Edit Page Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#100303] border border-white/15 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold" />
                {editingPage ? `Edit Page: ${editingPage.title}` : 'Add New Page'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="space-y-4">
              <div>
                <label className="text-white/70 text-xs font-medium block mb-1.5">
                  Page Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value)
                    if (!editingPage) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
                    }
                  }}
                  placeholder="e.g. Size Guide, FAQs, Shipping Details"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 text-xs font-medium block mb-1.5">
                    URL Slug
                  </label>
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden focus-within:border-gold">
                    <span className="px-2 text-xs text-white/40 font-mono">/</span>
                    <input
                      type="text"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                      placeholder="size-guide"
                      className="w-full bg-transparent px-1 py-2 text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/70 text-xs font-medium block mb-1.5">
                    Page Template / Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-[#180404] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="Content Page">Content Page</option>
                    <option value="Policy Page">Policy Page</option>
                    <option value="Landing Page">Landing Page</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/70 text-xs font-medium block mb-1.5">
                  Page Content / Description
                </label>
                <textarea
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write the page content, policies, or info..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div>
                <label className="text-white/70 text-xs font-medium block mb-1.5">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-[#180404] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="published">Published (Visible)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-white/70 text-xs hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formTitle.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gold text-black text-xs font-semibold hover:bg-gold/90 transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {editingPage ? 'Save Changes' : 'Publish Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PagesManagerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#C52A35] animate-spin" />
      </div>
    }>
      <PagesContent />
    </Suspense>
  )
}
