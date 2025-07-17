import React from 'react';
import Skeleton from 'react-loading-skeleton';

export default function VideoListItemSkeleton() {
  // Dark theme aware colors
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  
  const skeletonColors = {
    baseColor: isDark ? '#374151' : '#e0e0e0',
    highlightColor: isDark ? '#4b5563' : '#f0f0f0'
  };

  return (
    <div className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
      {/* Thumbnail */}
      <Skeleton 
        height={80} 
        width={120} 
        className="rounded-lg"
        baseColor={skeletonColors.baseColor}
        highlightColor={skeletonColors.highlightColor}
      />
      
      {/* Content */}
      <div className="flex-1">
        {/* Title */}
        <Skeleton 
          height={20} 
          width="80%" 
          className="mb-2"
          baseColor={skeletonColors.baseColor}
          highlightColor={skeletonColors.highlightColor}
        />
        
        {/* Description */}
        <Skeleton 
          height={16} 
          width="60%" 
          className="mb-3"
          baseColor={skeletonColors.baseColor}
          highlightColor={skeletonColors.highlightColor}
        />
        
        {/* Stats */}
        <div className="flex items-center gap-3">
          <Skeleton 
            height={14} 
            width={60}
            baseColor={skeletonColors.baseColor}
            highlightColor={skeletonColors.highlightColor}
          />
          <Skeleton 
            height={14} 
            width={50}
            baseColor={skeletonColors.baseColor}
            highlightColor={skeletonColors.highlightColor}
          />
          <Skeleton 
            height={14} 
            width={40}
            baseColor={skeletonColors.baseColor}
            highlightColor={skeletonColors.highlightColor}
          />
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2">
        <Skeleton 
          height={32} 
          width={32} 
          className="rounded-lg"
          baseColor={skeletonColors.baseColor}
          highlightColor={skeletonColors.highlightColor}
        />
        <Skeleton 
          height={32} 
          width={32} 
          className="rounded-lg"
          baseColor={skeletonColors.baseColor}
          highlightColor={skeletonColors.highlightColor}
        />
      </div>
    </div>
  );
}
