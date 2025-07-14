'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Video as VideoIcon, Eye, Heart, Folder, Plus, Edit2, Trash2, Clock } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Layout from '@/components/Layout'
import VideosPage from '@/components/pages/VideosPage'
import CategoriesPage from '@/components/pages/CategoriesPage'
import SettingsPage from '@/components/pages/SettingsPage'
import SliderManagementPage from '@/components/pages/SliderManagementPage'
import { Database } from '@/types/database'
import KPICardSkeleton from '@/components/skeletons/KPICardSkeleton'
import VideoListItemSkeleton from '@/components/skeletons/VideoListItemSkeleton'

type VideoType = Database['public']['Tables']['videos']['Row']

export default function Home() {
  const [videos, setVideos] = useState<VideoType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VideoType | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null)

  // Check dark mode on mount
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    }
  }, [])

  // Check authentication - TEMPORARILY DISABLED for testing
  useEffect(() => {
    // Temporarily bypass authentication for testing
    setIsAuthenticated(true)
    
    /* Original auth logic:
    const token = localStorage.getItem('auth_token')
    if (!token) {
      window.location.href = '/login'
      return
    }
    setIsAuthenticated(true)
    */
  }, [])

  // Load videos from Supabase with error handling
  const loadVideos = async () => {
    try {
      console.log('🔄 Loading videos...')
      const response = await fetch('/api/videos')
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos || [])
        console.log('✅ Videos loaded successfully:', data.videos?.length || 0)
        setError(null)
      } else {
        console.error('❌ Failed to load videos:', response.statusText)
        setError(`Failed to load videos: ${response.statusText}`)
      }
    } catch (error) {
      console.error('❌ Error loading videos:', error)
      setError(error instanceof Error ? error.message : 'Unknown error loading videos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadVideos()
    }
  }, [isAuthenticated]) // loadVideos dependency removed to prevent infinite loop

  const handleDeleteClick = (videoId: string) => {
    setVideoToDelete(videoId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteVideo = async () => {
    if (!videoToDelete) return

    try {
      const response = await fetch(`/api/videos/${videoToDelete}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadVideos()
        toast.success('Video başarıyla silindi!')
      } else {
        toast.error('Video silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Error deleting video:', error)
      toast.error('Video silinirken hata oluştu')
    } finally {
      setVideoToDelete(null)
      setShowDeleteConfirm(false)
    }
  }

  const startEditVideo = (video: VideoType) => {
    setEditingVideo(video)
    setShowEditModal(true)
  }

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

  // Show error if any
  if (error) {
    return (
      <Layout>
        {() => (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full mx-4">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Bir Hata Oluştu</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button 
                onClick={() => {
                  setError(null)
                  loadVideos()
                }}
                className="bg-[#9d1112] hover:bg-[#7a0d0e] text-white px-4 py-2 rounded-lg"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}
      </Layout>
    )
  }

  return (
    <Layout>
      {({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
        console.log('🏠 Current active tab:', activeTab)
        
        // Handle different tabs
        if (activeTab === 'videos') {
          return <VideosPage />
        }
        
        if (activeTab === 'categories') {
          return <CategoriesPage />
        }

        if (activeTab === 'slider') {
          return <SliderManagementPage />
        }

        
        if (activeTab === 'settings') {
          return <SettingsPage />
        }
        
        // Default dashboard
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

              {/* Video Management Skeleton */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  <div className="flex gap-3">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <VideoListItemSkeleton />
                  <VideoListItemSkeleton />
                  <VideoListItemSkeleton />
                  <VideoListItemSkeleton />
                  <VideoListItemSkeleton />
                </div>
              </div>
            </div>
          )
        }

        const totalViews = videos.reduce((sum: number, video: VideoType) => sum + (video.views || 0), 0)
        const totalLikes = videos.reduce((sum: number, video: VideoType) => sum + (video.likes || 0), 0)

        return (
        <>
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Toplam Video</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{videos.length}</p>
                    <p className="text-green-600 dark:text-green-400 text-sm mt-1">+12% bu ay</p>
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
                    <p className="text-green-600 dark:text-green-400 text-sm mt-1">+8% bu hafta</p>
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
                    <p className="text-green-600 dark:text-green-400 text-sm mt-1">+15% bu ay</p>
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
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">6</p>
                    <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">Tüm kategoriler aktif</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                    <Folder size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Video Management */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Video Yönetimi</h2>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveTab('videos')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <VideoIcon size={16} />
                    Tüm Videoları Görüntüle
                  </button>
                  <button 
                    onClick={() => setActiveTab('videos')}
                    className="bg-[#9d1112] hover:bg-[#7a0d0e] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Yeni Video
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {videos.map((video) => (
                  <div key={video.id} className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
                    <img 
                      src={video.thumbnail_url || '/placeholder.jpg'} 
                      alt="Video thumbnail" 
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{video.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{video.description}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {(video.views || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} />
                          {(video.likes || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {video.duration || 0} sn
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEditVideo(video)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="Videoyu düzenle"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(video.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title="Videoyu sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video Edit Modal */}
          {showEditModal && editingVideo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video Düzenle</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Video düzenleme işlemi için Videos sayfasına yönlendirileceksiniz.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowEditModal(false)
                        setActiveTab('videos')
                      }}
                      className="flex-1 bg-[#9d1112] hover:bg-[#7a0d0e] text-white px-4 py-2 rounded-lg"
                    >
                      Videos Sayfasına Git
                    </button>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-lg"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            onClose={() => {
              setShowDeleteConfirm(false)
              setVideoToDelete(null)
            }}
            onConfirm={confirmDeleteVideo}
            title="Video Sil"
            message="Bu videoyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
            confirmText="Evet, Sil"
            cancelText="İptal"
            type="danger"
          />
        </>
        )
      }}
    </Layout>
  )
}