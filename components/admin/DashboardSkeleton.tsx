'use client'

/**
 * DashboardSkeleton — Animasyonlu shimmer skeleton UI
 * Dashboard verisi yüklenirken kademeli gösterim sağlar.
 */
export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Connection Banner Skeleton */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-4 py-2 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-600 animate-pulse" />
        <div className="h-4 w-64 bg-slate-700/50 rounded animate-pulse" />
      </div>

      {/* Header + Filter Skeleton */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>

      {/* 6-Widget Grid Skeleton (2×3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          'from-cyan-600/20 to-blue-700/20',
          'from-emerald-600/20 to-teal-700/20',
          'from-orange-500/20 to-rose-600/20',
          'from-violet-600/20 to-purple-700/20',
          'from-red-600/20 to-red-800/20',
          'from-amber-500/20 to-yellow-600/20'
        ].map((gradient, i) => (
          <div key={i} className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-xl animate-pulse`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="h-3 w-32 bg-white/10 rounded" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <div className="h-12 w-24 bg-white/10 rounded-lg" />
                <div className="h-3 w-20 bg-white/10 rounded" />
              </div>
              <div className="space-y-2 text-right">
                <div className="h-6 w-20 bg-white/10 rounded ml-auto" />
                <div className="h-3 w-16 bg-white/10 rounded ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pickup Widget Skeleton */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 animate-pulse">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
        <div className="h-[200px] bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>

      {/* Agency Performance Skeleton */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* Forecast Skeleton */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-6 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 animate-pulse">
              <div className="h-3 w-14 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-6 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
        <div className="h-[380px] bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="h-[250px] bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Generic admin page skeleton — for sub-routes
 */
export function AdminPageSkeleton({ title }: { title?: string }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded mt-2 animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Filters bar */}
      <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />

      {/* Content cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-5 animate-pulse">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
            <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="h-12 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 animate-pulse" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className={`h-14 border-b border-slate-100 dark:border-slate-800 animate-pulse ${i % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-900/20' : ''}`}>
            <div className="flex items-center gap-4 px-4 h-full">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
