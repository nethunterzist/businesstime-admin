import React from 'react';
import Skeleton from 'react-loading-skeleton';

export default function SliderItemSkeleton() {
  // Dark theme aware colors
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  
  const skeletonColors = {
    baseColor: isDark ? '#374151' : '#e0e0e0',
    highlightColor: isDark ? '#4b5563' : '#f0f0f0'
  };

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      {/* Drag Handle */}
      <div className="flex flex-col space-y-1">
        <Skeleton 
          height={32} 
          width={32} 
          className="rounded"
          baseColor={skeletonColors.baseColor}
          highlightColor={skeletonColors.highlightColor}
        />
        <Skeleton 
          height={32} 
          width={32} 
          className="rounded"
          baseColor={skeletonColors.baseColor}
          highlightColor={skeletonColors.highlightColor}
        />
      </div>

      {/* Image Preview */}
      <Skeleton 
        height={48} 
        width={80} 
        className="rounded overflow-hidden"
        baseColor={skeletonColors.baseColor}
        highlightColor={skeletonColors.highlightColor}
      />

      {/* Content Info */}
      <div className="flex-1">
        {/* Title */}
        <Skeleton 
          height={18} 
          width="70%" 
          className="mb-2"
          baseColor={skeletonColors.baseColor}
          highlightColor={skeletonColors.highlightColor}
        />
        
        {/* Action description */}
        <Skeleton 
          height={14} 
          width="50%" 
          className="mb-1"
          baseColor={skeletonColors.baseColor}
          highlightColor={skeletonColors.highlightColor}
        />
        
        {/* Sort order and status */}
        <Skeleton 
          height={12} 
          width="40%"
          baseColor={skeletonColors.baseColor}
          highlightColor={skeletonColors.highlightColor}
        />
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {/* Active/Inactive Button */}
        <Skeleton 
          height={32} 
          width={60} 
          className="rounded"
          baseColor={skeletonColors.baseColor}
          highlightColor={skeletonColors.highlightColor}
        />
        
        {/* Edit Button */}
        <Skeleton 
          height={32} 
          width={70} 
          className="rounded"
          baseColor={skeletonColors.baseColor}
          highlightColor={skeletonColors.highlightColor}
        />
        
        {/* Delete Button */}
        <Skeleton 
          height={32} 
          width={50} 
          className="rounded"
          baseColor={skeletonColors.baseColor}
          highlightColor={skeletonColors.highlightColor}
        />
      </div>
    </div>
  );
}
