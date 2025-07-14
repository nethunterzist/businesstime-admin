'use client'

import { useState, useEffect } from 'react'
import { Video as VideoIcon, Eye, Heart, Folder } from 'lucide-react'
import Layout from '@/components/Layout'
import VideosPage from '@/components/pages/VideosPage'
import CategoriesPage from '@/components/pages/CategoriesPage'
import SettingsPage from '@/components/pages/SettingsPage'
import SliderManagementPage from '@/components/pages/SliderManagementPage'
import ReportsPage from '@/components/pages/ReportsPage'
import PushNotificationPage from '@/components/pages/PushNotificationPage'
import PagesManagementPage from '@/components/pages/PagesManagementPage'
import KPICardSkeleton from '@/components/skeletons/KPICardSkeleton'
import VideoListItemSkeleton from '@/components/skeletons/VideoListItemSkeleton'

export default function Home() {
  const [isAuthenticated] = useState(true) // Always authenticated for testing
  const [videos, setVideos] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      // Load videos
      const videosResponse = await fetch('/api/videos')
      if (videosResponse.ok) {
        const videosData = await videosResponse.json()
        const videos = videosData.videos || []
        setVideos(videos)
      } else {
        throw new Error(`Videos API error: ${videosResponse.statusText}`)
      }

      // Load categories
      const categoriesResponse = await fetch('/api/categories')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories || [])
      } else {
        throw new Error(`Categories API error: ${categoriesResponse.statusText}`)
      }

      setError(null)
      
    } catch (error) {
      console.error('❌ Data loading failed:', error)
      setError(`${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, []) // Only once on mount

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9d1112] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Yetkilendirme kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      {({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
        console.log('🏠 Current active tab:', activeTab)
        
        // Handle different tabs - NOW ACTIVE!
        if (activeTab === 'videos') {
          return <VideosPage />
        }
        
        if (activeTab === 'categories') {
          return <CategoriesPage />
        }

        if (activeTab === 'slider') {
          return <SliderManagementPage />
        }
        
        if (activeTab === 'notifications') {
          return <PushNotificationPage />
        }
        
        if (activeTab === 'pages') {
          return <PagesManagementPage />
        }
        
        if (activeTab === 'reports') {
          return <ReportsPage />
        }
        
        if (activeTab === 'settings') {
          return <SettingsPage />
        }
        
        if (isLoading) {
          return (
            <div className="space-y-6">
              {/* KPI Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICardSkeleton />
                <KPICardSkeleton />
                <KPICardSkeleton />
                <KPICardSkeleton />
              </div>

              {/* Video Lists Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* En Çok Beğenilenler Skeleton */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
                    <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <VideoListItemSkeleton key={index} />
                    ))}
                  </div>
                </div>

                {/* Son Eklenen Videolar Skeleton */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
                    <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <VideoListItemSkeleton key={index} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        if (error) {
          return (
            <div className="space-y-6">
              <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-xl border border-red-200 dark:border-red-800 text-center">
                <div className="text-red-500 text-6xl mb-4">❌</div>
                <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Veri Yükleme Hatası</h2>
                <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
                <button 
                  onClick={loadData}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          )
        }

        // STEP 3: Dashboard with REAL calculated data
        const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0)
        const totalLikes = videos.reduce((sum, video) => sum + (video.likes || 0), 0)
        
        return (
          <div className="space-y-6">
            {/* Real KPI Cards with Calculated Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Toplam Video</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{videos.length}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <VideoIcon size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Toplam Görüntüleme</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalViews.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                    <Eye size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Toplam Beğeni</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalLikes.toLocaleString()}</p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                    <Heart size={24} className="text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Aktif Kategori</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{categories.length}</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                    <Folder size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Video Statistics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* En Çok Beğenilenler */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">En Çok Beğenilenler</h3>
                  <Heart size={20} className="text-red-500" />
                </div>
                <div className="space-y-3">
                  {videos
                    .filter(video => video.is_published)
                    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                    .slice(0, 10)
                    .map((video, index) => (
                      <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                            {video.thumbnail_url ? (
                              <img 
                                src={video.thumbnail_url} 
                                alt={video.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const nextSibling = e.currentTarget.nextSibling as HTMLElement;
                                  if (nextSibling) nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center" style={{display: video.thumbnail_url ? 'none' : 'flex'}}>
                              <VideoIcon size={16} className="text-gray-500 dark:text-gray-400" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={video.title}>
                              {video.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {video.views?.toLocaleString() || 0} görüntüleme
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart size={14} className="text-red-500" />
                          <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {video.likes?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>
                    ))
                  }
                  {videos.filter(video => video.is_published).length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">Henüz yayınlanmış video bulunmuyor</p>
                  )}
                </div>
              </div>

              {/* Son Eklenen Videolar */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Son Eklenen Videolar</h3>
                  <VideoIcon size={20} className="text-blue-500" />
                </div>
                <div className="space-y-3">
                  {videos
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10)
                    .map((video, index) => (
                      <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                            {video.thumbnail_url ? (
                              <img 
                                src={video.thumbnail_url} 
                                alt={video.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const nextSibling = e.currentTarget.nextSibling as HTMLElement;
                                  if (nextSibling) nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center" style={{display: video.thumbnail_url ? 'none' : 'flex'}}>
                              <VideoIcon size={16} className="text-gray-500 dark:text-gray-400" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={video.title}>
                              {video.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(video.created_at).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {video.is_published ? (
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                              Yayında
                            </span>
                          ) : (
                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                              Taslak
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  }
                  {videos.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">Henüz video bulunmuyor</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }}
    </Layout>
  )
}
