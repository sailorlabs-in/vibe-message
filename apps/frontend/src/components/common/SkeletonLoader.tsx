import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const SkeletonBox: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-theme-bg-muted rounded-lg ${className}`} />
);

export const SkeletonText: React.FC<SkeletonProps & { lines?: number }> = ({
  className = '',
  lines = 1,
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`animate-pulse bg-theme-bg-muted rounded h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

export const SkeletonCircle: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-theme-bg-muted rounded-full ${className}`} />
);

/* ─── Page-Specific Skeletons ──────────────────────────────── */

export const DashboardSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Header */}
    <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <SkeletonBox className="h-10 w-48 mb-2 rounded-xl" />
        <SkeletonBox className="h-5 w-72 rounded-lg" />
      </div>
      <SkeletonBox className="h-12 w-32 rounded-xl" />
    </div>

    {/* Stats Grid */}
    <div className="grid md:grid-cols-3 gap-6 mb-10">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="backdrop-blur-2xl bg-theme-bg-secondary border border-theme-border rounded-[2rem] p-8"
        >
          <SkeletonBox className="w-12 h-12 rounded-2xl mb-6" />
          <SkeletonBox className="h-4 w-24 mb-3 rounded" />
          <SkeletonBox className="h-10 w-16 rounded" />
        </div>
      ))}
    </div>

    {/* Recent Apps */}
    <div className="backdrop-blur-2xl bg-theme-bg-secondary border border-theme-border rounded-[2rem] overflow-hidden">
      <div className="p-8 border-b border-theme-border">
        <SkeletonBox className="h-7 w-36 rounded-lg" />
      </div>
      <div className="p-4 sm:p-8 grid gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-6 bg-theme-bg-primary border border-theme-border rounded-2xl"
          >
            <div className="flex items-start gap-4">
              <SkeletonBox className="w-12 h-12 rounded-xl" />
              <div>
                <SkeletonBox className="h-5 w-40 mb-2 rounded" />
                <SkeletonBox className="h-4 w-56 rounded" />
              </div>
            </div>
            <SkeletonCircle className="w-10 h-10" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const AppsSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="flex justify-between items-center mb-8">
      <SkeletonBox className="h-9 w-36 rounded-xl" />
      <SkeletonBox className="h-10 w-32 rounded-lg" />
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="card p-6 border border-theme-border">
          <div className="flex justify-between items-start mb-3">
            <SkeletonBox className="h-6 w-36 rounded" />
            <SkeletonBox className="h-5 w-16 rounded-full" />
          </div>
          <SkeletonText className="mb-4" />
          <div className="pt-4 border-t border-theme-border">
            <SkeletonBox className="h-4 w-48 mb-1 rounded" />
            <SkeletonBox className="h-4 w-32 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const AppDetailsSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Header */}
    <div className="flex justify-between items-start mb-8">
      <div className="flex-1">
        <SkeletonBox className="h-9 w-64 mb-3 rounded-xl" />
        <SkeletonBox className="h-5 w-80 rounded" />
      </div>
      <div className="flex gap-2">
        <SkeletonBox className="h-10 w-16 rounded-lg" />
        <SkeletonBox className="h-10 w-20 rounded-lg" />
      </div>
    </div>

    {/* Stats */}
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-6">
          <SkeletonBox className="h-4 w-24 mb-2 rounded" />
          <SkeletonBox className="h-8 w-16 rounded" />
        </div>
      ))}
    </div>

    {/* Tabs */}
    <div className="flex border-b border-theme-border mb-6">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonBox key={i} className="h-10 w-24 mx-1 rounded-t-lg" />
      ))}
    </div>

    {/* Content */}
    <div className="card p-8">
      <SkeletonBox className="h-6 w-32 mb-6 rounded" />
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <SkeletonBox className="h-4 w-28 mb-2 rounded" />
            <SkeletonBox className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const UsersSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <SkeletonBox className="h-9 w-52 mb-8 rounded-xl" />
    <div className="mb-8 flex space-x-3">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonBox key={i} className="h-10 w-24 rounded-full" />
      ))}
    </div>
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-theme-border">
            {['Name', 'Email', 'Status', 'Role', 'App Limit', 'Actions'].map((h) => (
              <th key={h} className="py-4 px-4">
                <SkeletonBox className="h-4 w-16 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i} className="border-b border-theme-border">
              <td className="py-4 px-4">
                <SkeletonBox className="h-4 w-28 rounded" />
              </td>
              <td className="py-4 px-4">
                <SkeletonBox className="h-4 w-40 rounded" />
              </td>
              <td className="py-4 px-4">
                <SkeletonBox className="h-5 w-20 rounded-full" />
              </td>
              <td className="py-4 px-4">
                <SkeletonBox className="h-5 w-16 rounded" />
              </td>
              <td className="py-4 px-4">
                <SkeletonBox className="h-5 w-16 rounded" />
              </td>
              <td className="py-4 px-4 text-right">
                <SkeletonBox className="h-8 w-8 rounded-lg ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{
  rows?: number;
  cols?: number;
}> = ({ rows = 4, cols = 4 }) => (
  <div className="card overflow-hidden">
    <div className="p-6 mb-4">
      <SkeletonBox className="h-6 w-40 rounded-lg" />
    </div>
    <table className="w-full">
      <thead>
        <tr className="border-b border-theme-border">
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="p-4">
              <SkeletonBox className="h-4 w-20 rounded" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i} className="border-b border-theme-border">
            {Array.from({ length: cols }).map((_, j) => (
              <td key={j} className="p-4">
                <SkeletonBox className="h-4 w-24 rounded" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
