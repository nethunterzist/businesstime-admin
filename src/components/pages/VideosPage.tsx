'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Database } from '@/types/database'
import { 
  Video as VideoIcon, 
  CheckCircle, 
  Star, 
  Eye, 
  Plus, 
  Edit2, 
  Play, 
  Pause, 
  Trash2,
  Package,
  Search,
  Clock,
  Calendar,
  Heart,
  X,
  Save
} from 'lucide-react'
import VideoListItemSkeleton from '@/components/skeletons/VideoListItemSkeleton'
import KPICardSkeleton from '@/components/skeletons/KPICardSkeleton'

type VideoType = Database['public']['Tables']['videos']['Row']
type CategoryType = Database['public']['Tables']['categories']['Row']

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoType[]>([])
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VideoType | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null)
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    category_id: '',
    thumbnail_url: '',
    video_url: '',
    tags: '',
    is_published: false,
    is_featured: false
  })
  const videosPerPage = 30

  // Load videos from Supabase
  const loadVideos = async () => {
    try {
      const response = await fetch('/api/videos')
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos || [])
      }
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load categories from Supabase
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  useEffect(() => {
    loadVideos()
    loadCategories()
  }, [])

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (video.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || video.category_id === filterCategory
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'published' && video.is_published) ||
                         (filterStatus === 'draft' && !video.is_published) ||
                         (filterStatus === 'featured' && video.is_featured)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const startIndex = (currentPage - 1) * videosPerPage
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + videosPerPage)

  const togglePublish = async (videoId: string) => {
    try {
      const video = videos.find(v => v.id === videoId)
      if (!video) return

      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !video.is_published })
      })

      if (response.ok) {
        await loadVideos()
        toast.success(`Video ${!video.is_published ? 'yayınlandı' : 'yayından kaldırıldı'}!`)
      } else {
        toast.error('Video durumu güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error toggling publish:', error)
      toast.error('Video durumu güncellenirken hata oluştu')
    }
  }

  const toggleFeature = async (videoId: string) => {
    try {
      const video = videos.find(v => v.id === videoId)
      if (!video) return

      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !video.is_featured })
      })

      if (response.ok) {
        await loadVideos()
        toast.success(`Video ${!video.is_featured ? 'öne çıkarıldı' : 'öne çıkarılmaktan çıkarıldı'}!`)
      } else {
        toast.error('Video öne çıkarma durumu güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error toggling feature:', error)
      toast.error('Video öne çıkarma durumu güncellenirken hata oluştu')
    }
  }

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

  const addVideo = async () => {
    if (newVideo.title.trim()) {
      try {
        const response = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVideo)
        })

        if (response.ok) {
          await loadVideos()
          setNewVideo({
            title: '',
            description: '',
            category_id: '',
            thumbnail_url: '',
            video_url: '',
            tags: '',
            is_published: false,
            is_featured: false
          })
          setShowAddForm(false)
          toast.success('Video başarıyla eklendi!')
        } else {
          const errorData = await response.json()
          console.error('Failed to add video:', errorData)
          toast.error(`Video ekleme hatası: ${errorData.error || 'Bilinmeyen hata'}`)
        }
      } catch (error) {
        console.error('Error adding video:', error)
        toast.error(`Video ekleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
      }
    }
  }

  const startEditVideo = (video: VideoType) => {
    setEditingVideo(video)
    setNewVideo({
      title: video.title,
      description: video.description || '',
      category_id: video.category_id || '',
      thumbnail_url: video.thumbnail_url || '',
      video_url: video.video_url || '',
      tags: (typeof video.tags === 'string' ? video.tags : '') || '',
      is_published: video.is_published,
      is_featured: video.is_featured
    })
    setShowEditForm(true)
  }

  const updateVideo = async () => {
    if (editingVideo && newVideo.title.trim()) {
      try {
        const response = await fetch(`/api/videos/${editingVideo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVideo)
        })

        if (response.ok) {
          await loadVideos()
          setEditingVideo(null)
          setNewVideo({
            title: '',
            description: '',
            category_id: '',
            thumbnail_url: '',
            video_url: '',
            tags: '',
            is_published: false,
            is_featured: false
          })
          setShowEditForm(false)
          toast.success('Video başarıyla güncellendi!')
        } else {
          const errorData = await response.json()
          console.error('Failed to update video:', errorData)
          toast.error(`Video güncelleme hatası: ${errorData.error || 'Bilinmeyen hata'}`)
        }
      } catch (error) {
        console.error('Error updating video:', error)
        toast.error(`Video güncelleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
              <div className="w-40 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
              <div className="w-32 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
            </div>
            <div className="w-32 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Videos Table Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-32 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-48 animate-pulse"></div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <VideoListItemSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Yayınlanan</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {videos.filter(v => v.is_published).length}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Öne Çıkan</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {videos.filter(v => v.is_featured).length}
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <Star size={24} className="text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Toplam İzlenme</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {videos.reduce((total: number, video: VideoType) => total + (video.views || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <Eye size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <Input
                placeholder="Video ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Tüm Durumlar</option>
              <option value="published">Yayınlanan</option>
              <option value="draft">Taslak</option>
              <option value="featured">Öne Çıkan</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setNewVideo({
                  title: '',
                  description: '',
                  category_id: '',
                  thumbnail_url: '',
                  video_url: '',
                  tags: '',
                  is_published: false,
                  is_featured: false
                })
                setShowAddForm(true)
              }}
              className="bg-[#9d1112] hover:bg-[#7a0d0e] text-white flex items-center gap-2"
            >
              <Plus size={16} />
              Yeni Video
            </Button>
          </div>
        </div>
      </div>

      {/* Videos Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Videolar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredVideos.length} videodan {paginatedVideos.length} tanesi gösteriliyor
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {paginatedVideos.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Video bulunamadı</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Arama kriterlerinizi değiştirin veya yeni video ekleyin</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <VideoListItemSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <img 
                    src={video.thumbnail_url || '/placeholder.jpg'} 
                    alt={video.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{video.title}</h4>
                      {video.is_featured && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Star size={12} />
                          Öne Çıkan
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        video.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {video.is_published ? (
                          <>
                            <CheckCircle size={12} />
                            Yayında
                          </>
                        ) : (
                          <>
                            <Pause size={12} />
                            Taslak
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">{video.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {(video.views || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={12} />
                        {(video.likes || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(video.created_at).toLocaleDateString('tr-TR')}
                      </span>
                      {video.category_id && (
                        <span className="flex items-center gap-1">
                          <Package size={12} />
                          {categories.find(cat => cat.id === video.category_id)?.name || 'Kategori'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => togglePublish(video.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        video.is_published
                          ? 'text-gray-400 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          : 'text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                      title={video.is_published ? 'Yayından kaldır' : 'Yayınla'}
                    >
                      {video.is_published ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button 
                      onClick={() => startEditVideo(video)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Videoyu düzenle"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => toggleFeature(video.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        video.is_featured
                          ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                          : 'text-gray-400 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                      }`}
                      title="Öne çıkar"
                    >
                      <Star size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(video.id)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Videoyu sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Video Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Yeni Video Ekle</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video Başlığı *
                  </label>
                  <Input
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    placeholder="Video başlığını girin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Açıklama
                  </label>
                  <Textarea
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                    placeholder="Video açıklamasını girin"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori
                  </label>
                  <select
                    value={newVideo.category_id}
                    onChange={(e) => setNewVideo({ ...newVideo, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video URL
                  </label>
                  <Input
                    value={newVideo.video_url}
                    onChange={(e) => setNewVideo({ ...newVideo, video_url: e.target.value })}
                    placeholder="Video URL'sini girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thumbnail URL
                  </label>
                  <Input
                    value={newVideo.thumbnail_url}
                    onChange={(e) => setNewVideo({ ...newVideo, thumbnail_url: e.target.value })}
                    placeholder="Thumbnail URL'sini girin"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Etiketler
                  </label>
                  <Input
                    value={newVideo.tags}
                    onChange={(e) => setNewVideo({ ...newVideo, tags: e.target.value })}
                    placeholder="girişimcilik, startup, teknoloji, yatırım"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Etiketleri virgülle ayırarak yazın. Arama sonuçlarında daha kolay bulunması için kullanılır.
                  </p>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newVideo.is_published}
                      onChange={(e) => setNewVideo({ ...newVideo, is_published: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Yayınla</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newVideo.is_featured}
                      onChange={(e) => setNewVideo({ ...newVideo, is_featured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Öne Çıkar</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <Button 
                  onClick={addVideo}
                  disabled={!newVideo.title.trim()}
                  className="bg-[#9d1112] hover:bg-[#7a0d0e] text-white flex items-center gap-2"
                >
                  <Save size={16} />
                  Video Ekle
                </Button>
                <Button 
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X size={16} />
                  İptal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {showEditForm && editingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Video Düzenle</h3>
                <button
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingVideo(null)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video Başlığı *
                  </label>
                  <Input
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    placeholder="Video başlığını girin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Açıklama
                  </label>
                  <Textarea
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                    placeholder="Video açıklamasını girin"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori
                  </label>
                  <select
                    value={newVideo.category_id}
                    onChange={(e) => setNewVideo({ ...newVideo, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video URL
                  </label>
                  <Input
                    value={newVideo.video_url}
                    onChange={(e) => setNewVideo({ ...newVideo, video_url: e.target.value })}
                    placeholder="Video URL'sini girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thumbnail URL
                  </label>
                  <Input
                    value={newVideo.thumbnail_url}
                    onChange={(e) => setNewVideo({ ...newVideo, thumbnail_url: e.target.value })}
                    placeholder="Thumbnail URL'sini girin"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Etiketler
                  </label>
                  <Input
                    value={newVideo.tags}
                    onChange={(e) => setNewVideo({ ...newVideo, tags: e.target.value })}
                    placeholder="girişimcilik, startup, teknoloji, yatırım"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Etiketleri virgülle ayırarak yazın. Arama sonuçlarında daha kolay bulunması için kullanılır.
                  </p>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newVideo.is_published}
                      onChange={(e) => setNewVideo({ ...newVideo, is_published: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Yayınla</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newVideo.is_featured}
                      onChange={(e) => setNewVideo({ ...newVideo, is_featured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Öne Çıkar</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <Button 
                  onClick={updateVideo}
                  disabled={!newVideo.title.trim()}
                  className="bg-[#9d1112] hover:bg-[#7a0d0e] text-white flex items-center gap-2"
                >
                  <Save size={16} />
                  Video Güncelle
                </Button>
                <Button 
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingVideo(null)
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X size={16} />
                  İptal
                </Button>
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
    </div>
  )
}
