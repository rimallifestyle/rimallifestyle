"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Users as UsersIcon, UserCheck, UserPlus, ShieldAlert, Mail, Edit, Trash2, Search, X, Check, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { KpiSkeleton, TableSkeleton } from '@/components/ui/Skeleton'
import { fetchWithAuth } from '@/lib/api'

interface User {
  id: string
  name: string | null
  email: string
  role: 'admin' | 'shop_manager' | 'customer'
  status: 'active' | 'inactive' | 'banned'
  phone: string | null
  address: string | null
  avatar?: string | null
  created_at: string
}

interface Stats {
  total: string
  active: string
  banned: string
  new_this_month: string
}

interface ApiResponse {
  success: boolean
  users: User[]
  total: number
  page: number
  limit: number
  pages: number
  stats: Stats
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  shop_manager: 'Manager',
  customer: 'Customer',
}

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  shop_manager: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  customer: 'bg-white/5 text-white/70 border-white/10',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'text-emerald-400 bg-emerald-400/10',
  inactive: 'text-white/50 bg-white/5',
  banned: 'text-red-400 bg-red-400/10',
}

const STATUS_DOT: Record<string, string> = {
  active: 'bg-emerald-400',
  inactive: 'bg-white/50',
  banned: 'bg-red-400',
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
  } catch {
    return iso
  }
}

export default function UsersPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch]   = useState('')
  const [roleFilter, setRole] = useState('all')
  const [statusFilter, setStatus] = useState('all')
  const [page, setPage]       = useState(1)

  // Inline editing state
  const [editingUser, setEditingUser]   = useState<User | null>(null)
  const [editRole, setEditRole]         = useState<string>('')
  const [editStatus, setEditStatus]     = useState<string>('')
  const [savingId, setSavingId]         = useState<string | null>(null)
  const [deletingId, setDeletingId]     = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const fetchUsers = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
      })
      const res = await fetch(`/api/admin/users?${params}`)
      const data: ApiResponse = await res.json()
      if (!res.ok) throw new Error((data as any).message || 'Failed to load users.')
      setData(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load users.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, roleFilter, statusFilter, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchUsers() }, 400)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const startEdit = (user: User) => {
    setEditingUser(user)
    setEditRole(user.role)
    setEditStatus(user.status)
  }

  const cancelEdit = () => setEditingUser(null)

  const saveEdit = async () => {
    if (!editingUser) return
    setSavingId(editingUser.id)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingUser.id, role: editRole, status: editStatus }),
      })
      if (!res.ok) throw new Error('Failed to update user.')
      setEditingUser(null)
      fetchUsers(true)
    } catch (e: any) {
      alert(e.message || 'Failed to update user.')
    } finally {
      setSavingId(null)
    }
  }

  const deleteUser = async (userId: string) => {
    setDeletingId(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      })
      if (!res.ok) throw new Error('Failed to delete user.')
      setConfirmDelete(null)
      fetchUsers(true)
    } catch (e: any) {
      alert(e.message || 'Failed to delete user.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
        </div>
        <TableSkeleton />
      </div>
    )
  }

  const stats = data?.stats
  const users = data?.users ?? []

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Page Header */}
      <ScrollReveal delay={0.1}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">User Management</h1>
            <p className="text-white/60 text-sm">Track and manage all customers and admins in real-time.</p>
          </div>
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="flex items-center gap-2 h-10 px-5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
      </ScrollReveal>

      {/* Error banner */}
      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScrollReveal delay={0.15}>
          <KpiCard title="Total Users" value={stats?.total ?? '—'} change="" isPositive={true} comparison="all time" icon={<UsersIcon className="w-5 h-5" />} />
        </ScrollReveal>
        <ScrollReveal delay={0.25}>
          <KpiCard title="Active Users" value={stats?.active ?? '—'} change="" isPositive={true} comparison="currently active" icon={<UserCheck className="w-5 h-5" />} />
        </ScrollReveal>
        <ScrollReveal delay={0.35}>
          <KpiCard title="New This Month" value={stats?.new_this_month ?? '—'} change="" isPositive={true} comparison="joined this month" icon={<UserPlus className="w-5 h-5" />} />
        </ScrollReveal>
        <ScrollReveal delay={0.45}>
          <KpiCard title="Banned" value={stats?.banned ?? '—'} change="" isPositive={false} comparison="total banned accounts" icon={<ShieldAlert className="w-5 h-5" />} />
        </ScrollReveal>
      </div>

      {/* Users Table */}
      <ScrollReveal delay={0.2}>
        <div className="glass-card rounded-3xl p-6 mt-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-medium text-white/90">
              All Users <span className="text-sm text-white/40 font-normal ml-1">({data?.total ?? 0})</span>
            </h2>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search name or email…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  className="h-9 w-full sm:w-52 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                />
                {search && (
                  <button onClick={() => { setSearch(''); setPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={e => { setRole(e.target.value); setPage(1) }}
                className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="shop_manager">Manager</option>
                <option value="customer">Customer</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={e => { setStatus(e.target.value); setPage(1) }}
                className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <UsersIcon className="w-12 h-12 text-white/10 mb-4" />
              <p className="text-white/40 text-sm">No users found matching your filters.</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[820px] border-separate" style={{ borderSpacing: '0 4px' }}>
                <thead>
                  <tr>
                    <th className="pb-3 text-xs font-medium text-white/40 pl-4 border-b border-white/10 uppercase tracking-wider">User</th>
                    <th className="pb-3 text-xs font-medium text-white/40 border-b border-white/10 uppercase tracking-wider">Role</th>
                    <th className="pb-3 text-xs font-medium text-white/40 border-b border-white/10 uppercase tracking-wider">Status</th>
                    <th className="pb-3 text-xs font-medium text-white/40 border-b border-white/10 uppercase tracking-wider">Phone</th>
                    <th className="pb-3 text-xs font-medium text-white/40 border-b border-white/10 uppercase tracking-wider">Joined</th>
                    <th className="pb-3 text-xs font-medium text-white/40 text-right pr-4 border-b border-white/10 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isEditing = editingUser?.id === user.id
                    const isDeleting = deletingId === user.id
                    const isSaving   = savingId === user.id

                    return (
                      <tr key={user.id} className="group cursor-pointer">
                        {/* User info */}
                        <td className="py-3.5 pl-4 rounded-l-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9 border border-white/10 shrink-0">
                              <AvatarImage 
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=550000&color=fff`} 
                                className="object-cover" 
                              />
                              <AvatarFallback className="bg-[#550000] text-white text-sm font-bold">
                                {(user.name || user.email).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white group-hover:text-[#C52A35] transition-colors truncate">{user.name || <span className="text-white/40 italic">No name</span>}</p>
                              <p className="text-xs text-white/50 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                          {isEditing ? (
                            <select
                              value={editRole}
                              onChange={e => setEditRole(e.target.value)}
                              className="h-8 px-2 rounded-lg bg-white/10 border border-white/20 text-xs text-white focus:outline-none"
                            >
                              <option value="admin">Admin</option>
                              <option value="shop_manager">Manager</option>
                              <option value="customer">Customer</option>
                            </select>
                          ) : (
                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", ROLE_STYLES[user.role] ?? ROLE_STYLES.customer)}>
                              {ROLE_LABELS[user.role] ?? user.role}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                          {isEditing ? (
                            <select
                              value={editStatus}
                              onChange={e => setEditStatus(e.target.value)}
                              className="h-8 px-2 rounded-lg bg-white/10 border border-white/20 text-xs text-white focus:outline-none"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="banned">Banned</option>
                            </select>
                          ) : (
                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit", STATUS_STYLES[user.status] ?? STATUS_STYLES.inactive)}>
                              <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[user.status] ?? STATUS_DOT.inactive)} />
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          )}
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 text-sm text-white/60 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                          {user.phone || <span className="text-white/20 italic text-xs">—</span>}
                        </td>

                        {/* Joined */}
                        <td className="py-3.5 text-sm text-white/60 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                          {formatDate(user.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pr-4 rounded-r-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={saveEdit}
                                  disabled={isSaving}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-colors"
                                >
                                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 text-xs font-medium transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Cancel
                                </button>
                              </>
                            ) : confirmDelete === user.id ? (
                              <>
                                <span className="text-xs text-red-400 mr-1">Delete?</span>
                                <button
                                  onClick={() => deleteUser(user.id)}
                                  disabled={isDeleting}
                                  className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Yes'}
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 text-xs font-medium transition-colors"
                                >
                                  No
                                </button>
                              </>
                            ) : (
                              <>
                                <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors" title="Email" onClick={() => window.open(`mailto:${user.email}`)}>
                                  <Mail className="w-4 h-4" />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-blue-400 transition-colors" title="Edit" onClick={() => startEdit(user)}>
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-red-400 transition-colors" title="Delete" onClick={() => setConfirmDelete(user.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {(data?.pages ?? 0) > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-white/50">
                Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, data?.total ?? 0)} of {data?.total ?? 0} users
              </p>
              <div className="flex gap-1 items-center">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1 rounded-md bg-white/5 text-white/50 hover:bg-white/10 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>

                {Array.from({ length: Math.min(5, data?.pages ?? 0) }, (_, i) => {
                  const pg = i + 1
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={cn(
                        "px-3 py-1 rounded-md text-sm",
                        page === pg ? "bg-[#550000] text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
                      )}
                    >
                      {pg}
                    </button>
                  )
                })}

                <button
                  onClick={() => setPage(p => Math.min(data?.pages ?? 1, p + 1))}
                  disabled={page === (data?.pages ?? 1)}
                  className="flex items-center gap-1 px-3 py-1 rounded-md bg-white/5 text-white/50 hover:bg-white/10 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  )
}
