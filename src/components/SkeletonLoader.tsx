'use client';

import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden glass-card p-3 space-y-3">
      <div className="w-full aspect-[3/4] rounded-xl skeleton-shimmer" />
      <div className="h-4 w-2/3 rounded skeleton-shimmer" />
      <div className="h-3 w-1/3 rounded skeleton-shimmer" />
      <div className="h-5 w-1/2 rounded skeleton-shimmer pt-2" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}
