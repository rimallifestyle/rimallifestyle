"use client"

import { DashboardLayout } from "@/components/admin/layout/DashboardLayout"
import { AdminThemeProvider } from "@/context/AdminThemeContext"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminThemeProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AdminThemeProvider>
  )
}
