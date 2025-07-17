import React from 'react';
import Skeleton from 'react-loading-skeleton';

interface TableRowSkeletonProps {
  columns?: number;
  showActions?: boolean;
}

export default function TableRowSkeleton({ columns = 4, showActions = true }: TableRowSkeletonProps) {
  // Dark theme aware colors
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  
  const skeletonColors = {
    baseColor: isDark ? '#374151' : '#e0e0e0',
    highlightColor: isDark ? '#4b5563' : '#f0f0f0'
  };

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700">
      {/* Generate skeleton cells based on column count */}
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <Skeleton 
            height={16} 
            width={index === 0 ? "80%" : "60%"} 
            baseColor={skeletonColors.baseColor}
            highlightColor={skeletonColors.highlightColor}
          />
        </td>
      ))}
      
      {/* Actions column */}
      {showActions && (
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <Skeleton 
              height={28} 
              width={28} 
              className="rounded"
              baseColor={skeletonColors.baseColor}
              highlightColor={skeletonColors.highlightColor}
            />
            <Skeleton 
              height={28} 
              width={28} 
              className="rounded"
              baseColor={skeletonColors.baseColor}
              highlightColor={skeletonColors.highlightColor}
            />
          </div>
        </td>
      )}
    </tr>
  );
}
