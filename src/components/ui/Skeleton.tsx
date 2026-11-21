import React from 'react'
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/10", className)}
      {...props}
    />
  )
}

export function KpiSkeleton() {
  return (
    <div className="glass-card rounded-3xl p-6 h-[140px] flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-8 w-[150px]" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-4 w-[120px]" />
    </div>
  )
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card rounded-3xl p-6 flex flex-col", className)}>
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
        <Skeleton className="h-8 w-[100px] rounded-lg" />
      </div>
      <Skeleton className="flex-1 w-full rounded-xl" />
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="glass-card rounded-3xl p-6 mt-4">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-9 w-[250px] rounded-xl" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  )
}

export { Skeleton }
