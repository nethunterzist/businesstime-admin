import React from 'react';
import Skeleton from 'react-loading-skeleton';

export default function CategoryListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      {/* Icon */}
      <Skeleton 
        height={48} 
        width={48} 
        circle
        baseColor="#e0e0e0"
        highlightColor="#f0f0f0"
      />
      
      {/* Content */}
      <div className="flex-1">
        {/* Category Name */}
        <Skeleton 
          height={20} 
          width="60%" 
          className="mb-2"
          baseColor="#e0e0e0"
          highlightColor="#f0f0f0"
        />
        
        {/* Description */}
        <Skeleton 
          height={16} 
          width="80%" 
          className="mb-2"
          baseColor="#e0e0e0"
          highlightColor="#f0f0f0"
        />
        
        {/* Video count and meta */}
        <div className="flex items-center gap-3">
          <Skeleton 
            height={14} 
            width={80}
            baseColor="#e0e0e0"
            highlightColor="#f0f0f0"
          />
          <Skeleton 
            height={14} 
            width={60}
            baseColor="#e0e0e0"
            highlightColor="#f0f0f0"
          />
        </div>
      </div>
      
      {/* Status badge */}
      <Skeleton 
        height={24} 
        width={60} 
        className="rounded-full"
        baseColor="#e0e0e0"
        highlightColor="#f0f0f0"
      />
      
      {/* Action buttons */}
      <div className="flex gap-2">
        <Skeleton 
          height={32} 
          width={32} 
          className="rounded-lg"
          baseColor="#e0e0e0"
          highlightColor="#f0f0f0"
        />
        <Skeleton 
          height={32} 
          width={32} 
          className="rounded-lg"
          baseColor="#e0e0e0"
          highlightColor="#f0f0f0"
        />
      </div>
    </div>
  );
}