import React from 'react';
import Skeleton from 'react-loading-skeleton';

export default function KPICardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Label */}
          <Skeleton 
            height={16} 
            width="70%" 
            className="mb-3"
            baseColor="#e0e0e0"
            highlightColor="#f0f0f0"
          />
          
          {/* Value */}
          <Skeleton 
            height={32} 
            width="50%" 
            className="mb-2"
            baseColor="#e0e0e0"
            highlightColor="#f0f0f0"
          />
          
          {/* Change indicator */}
          <Skeleton 
            height={14} 
            width="40%"
            baseColor="#e0e0e0"
            highlightColor="#f0f0f0"
          />
        </div>
        
        {/* Icon */}
        <Skeleton 
          height={48} 
          width={48} 
          className="rounded-lg"
          baseColor="#e0e0e0"
          highlightColor="#f0f0f0"
        />
      </div>
    </div>
  );
}