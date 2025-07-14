import React from 'react';
import Skeleton from 'react-loading-skeleton';

interface TableRowSkeletonProps {
  columns?: number;
  showActions?: boolean;
}

export default function TableRowSkeleton({ columns = 4, showActions = true }: TableRowSkeletonProps) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700">
      {/* Generate skeleton cells based on column count */}
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <Skeleton 
            height={16} 
            width={index === 0 ? "80%" : "60%"} 
            baseColor="#e0e0e0"
            highlightColor="#f0f0f0"
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
              baseColor="#e0e0e0"
              highlightColor="#f0f0f0"
            />
            <Skeleton 
              height={28} 
              width={28} 
              className="rounded"
              baseColor="#e0e0e0"
              highlightColor="#f0f0f0"
            />
          </div>
        </td>
      )}
    </tr>
  );
}