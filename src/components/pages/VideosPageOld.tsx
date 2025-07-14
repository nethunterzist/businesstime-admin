'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import VideoForm from '@/components/VideoForm'
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
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Heart
} from 'lucide-react'

type Video = Database['public']['Tables']['videos']['Row']



export default function VideosPage() {
  console.log('📺 VideosPage component rendered')
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const videosPerPage = 30
  const [categories, setCategories] = useState<string[]>([
    'Teaserlarımız',
    'Konuklar Bizi Anlatıyor', 
    'Bana Göre',
    'Uzmanlık Sorusu',
    'Başarının Zorlu Yolları Mercek\'te',
    'Aşkla Yapıyoruz'
  ])

  // Load videos from Supabase
  const loadVideos = async () => {
    try {
      console.log('📂 Loading videos from Supabase...')
      const response = await fetch('/api/videos')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Loaded videos from Supabase:', data.videos)
        setVideos(data.videos || [])
      } else {
        console.log('❌ Failed to load from Supabase')
        setVideos([])
      }
    } catch (error) {
      console.error('❌ Error loading videos:', error)
      setVideos([])
    } finally {
      setIsLoading(false)
    }
  }

  // Save videos to shared JSON file
  const saveVideos = async (updatedVideos: Video[]) => {
    try {
      console.log('💾 Saving videos to shared JSON...')
      const transformedVideos = updatedVideos.map(video => ({
        id: video.id.toString(),
        title: video.title,
        description: video.description,
        video_url: video.url,
        thumbnail_url: video.thumbnail,
        category: video.category,
        likes: video.likes,
        views: video.views,
        created_at: video.createdAt
      }))

      const dataToSave = {
        videos: transformedVideos,
        categories: [
          { "id": "teaserlarimiz", "name": "Teaserlarımız", "icon": "videocam" },
          { "id": "konuklar-bizi-anlatiyor", "name": "Konuklar Bizi Anlatıyor", "icon": "mic" },
          { "id": "bana-gore", "name": "Bana Göre", "icon": "chatbubble" },
          { "id": "uzmanlik-sorusu", "name": "Uzmanlık Sorusu", "icon": "bulb" },
          { "id": "mercek", "name": "Başarının Zorlu Yolları Mercek'te", "icon": "search" },
          { "id": "askla-yapiyoruz", "name": "Aşkla Yapıyoruz", "icon": "heart" }
        ]
      }

      // Save to shared-data folder
      const response = await fetch('/api/save-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave)
      })

      if (response.ok) {
        console.log('✅ Videos saved to shared JSON successfully!')
      } else {
        console.log('❌ Failed to save to shared JSON')
      }
    } catch (error) {
      console.error('❌ Error saving videos:', error)
    }
  }

  // Load categories from Supabase
  const loadCategories = async () => {
    try {
      console.log('📂 Loading categories from Supabase...')
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        const categoryNames = data.categories.map((cat: any) => cat.name)
        setCategories(categoryNames)
        console.log('✅ Categories loaded:', categoryNames)
      } else {
        console.log('❌ Failed to load categories, using defaults')
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error)
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

  const totalPages = Math.ceil(filteredVideos.length / videosPerPage)
  const startIndex = (currentPage - 1) * videosPerPage
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + videosPerPage)

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    )
  }

  const selectAllVideos = () => {
    setSelectedVideos(
      selectedVideos.length === paginatedVideos.length 
        ? [] 
        : paginatedVideos.map(video => video.id)
    )
  }

  const bulkPublish = () => {
    const updatedVideos = videos.map(video => 
      selectedVideos.includes(video.id) ? { ...video, isPublished: true } : video
    )
    setVideos(updatedVideos)
    saveVideos(updatedVideos)
    setSelectedVideos([])
    setShowBulkActions(false)
  }

  const bulkUnpublish = () => {
    setVideos(videos.map(video => 
      selectedVideos.includes(video.id) ? { ...video, isPublished: false } : video
    ))
    setSelectedVideos([])
    setShowBulkActions(false)
  }

  const bulkFeature = () => {
    setVideos(videos.map(video => 
      selectedVideos.includes(video.id) ? { ...video, isFeatured: true } : video
    ))
    setSelectedVideos([])
    setShowBulkActions(false)
  }

  const bulkDelete = () => {
    if (confirm(`${selectedVideos.length} videoyu silmek istediğinizden emin misiniz?`)) {
      setVideos(videos.filter(video => !selectedVideos.includes(video.id)))
      setSelectedVideos([])
      setShowBulkActions(false)
    }
  }

  const togglePublish = (videoId: number) => {
    setVideos(videos.map(video => 
      video.id === videoId ? { ...video, isPublished: !video.isPublished } : video
    ))
  }

  const toggleFeature = (videoId: number) => {
    setVideos(videos.map(video => 
      video.id === videoId ? { ...video, isFeatured: !video.isFeatured } : video
    ))
  }

  const deleteVideo = (videoId: number) => {
    if (confirm('Bu videoyu silmek istediğinizden emin misiniz?')) {
      setVideos(videos.filter(video => video.id !== videoId))
    }
  }

  const openAddVideoForm = () => {
    console.log('🆕 Open Add Video Form called')
    setEditingVideo(null)
    setShowVideoForm(true)
    console.log('✅ Video form opened for adding')
  }

  const openEditVideoForm = (video: Video) => {
    console.log('✏️ Open Edit Video Form called with:', video)
    setEditingVideo(video)
    setShowVideoForm(true)
    console.log('✅ Video form opened for editing')
  }

  const handleSaveVideo = (videoData: any) => {
    console.log('💾 Handle Save Video called with:', videoData)
    console.log('📝 Editing video:', editingVideo)
    
    let updatedVideos: Video[]
    
    if (editingVideo) {
      // Düzenleme
      console.log('✏️ Updating existing video')
      updatedVideos = videos.map(video => 
        video.id === editingVideo.id 
          ? { ...video, ...videoData }
          : video
      )
      console.log('✅ Updated videos list:', updatedVideos)
    } else {
      // Yeni ekleme
      console.log('➕ Adding new video')
      const newVideo: Video = {
        id: Date.now(),
        ...videoData,
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0
      }
      console.log('✅ New video object:', newVideo)
      updatedVideos = [...videos, newVideo]
      console.log('✅ Updated videos list:', updatedVideos)
    }
    
    setVideos(updatedVideos)
    saveVideos(updatedVideos)
    setShowVideoForm(false)
    setEditingVideo(null)
    console.log('✅ Video saved successfully!')
  }

  const handleCancelVideoForm = () => {
    console.log('❌ Video form cancelled')
    setShowVideoForm(false)
    setEditingVideo(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9d1112] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Videolar yükleniyor...</p>
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
              <Video size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Yayınlanan</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {videos.filter(v => v.isPublished).length}
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
                {videos.filter(v => v.isFeatured).length}
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
                {videos.reduce((total: number, video) => total + video.views, 0).toLocaleString()}
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
                <option key={cat} value={cat}>{cat}</option>
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
            {selectedVideos.length > 0 && (
              <Button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Package size={16} />
                Toplu İşlemler ({selectedVideos.length})
              </Button>
            )}
            <Button 
              onClick={() => {
                console.log('🔘 Yeni Video button clicked!')
                openAddVideoForm()
              }}
              className="bg-[#9d1112] hover:bg-[#7a0d0e] text-white flex items-center gap-2"
            >
              <Plus size={16} />
              Yeni Video
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && selectedVideos.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={bulkPublish} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1">
                <CheckCircle size={14} />
                Yayınla
              </Button>
              <Button size="sm" onClick={bulkUnpublish} className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1">
                <Pause size={14} />
                Yayından Kaldır
              </Button>
              <Button size="sm" onClick={bulkFeature} className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-1">
                <Star size={14} />
                Öne Çıkar
              </Button>
              <Button size="sm" onClick={bulkDelete} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1">
                <Trash2 size={14} />
                Sil
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Videos Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Videolar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredVideos.length} videodan {paginatedVideos.length} tanesi gösteriliyor (Sayfa {currentPage}/{totalPages})
              </p>
            </div>
            {paginatedVideos.length > 0 && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedVideos.length === paginatedVideos.length}
                  onChange={selectAllVideos}
                  className="rounded"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Bu Sayfayı Seç</span>
              </div>
            )}
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
          ) : (
            <div className="space-y-4">
              {paginatedVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedVideos.includes(video.id)}
                    onChange={() => toggleVideoSelection(video.id)}
                    className="rounded"
                  />

                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop'
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{video.title}</h4>
                      {video.isFeatured && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Star size={12} />
                          Öne Çıkan
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        video.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {video.isPublished ? (
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
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded-full">
                        {video.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {video.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={12} />
                        {video.likes.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {video.duration} dk
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(video.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditVideoForm(video)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => togglePublish(video.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        video.isPublished
                          ? 'text-gray-400 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          : 'text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      {video.isPublished ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button 
                      onClick={() => toggleFeature(video.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        video.isFeatured
                          ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                          : 'text-gray-400 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                      }`}
                    >
                      <Star size={16} />
                    </button>
                    <button 
                      onClick={() => deleteVideo(video.id)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Sayfa {currentPage} / {totalPages} ({filteredVideos.length} toplam video)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ChevronLeft size={16} />
                  Önceki
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className={currentPage === pageNum ? "bg-[#9d1112] text-white" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  Sonraki
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Form Modal */}
      <VideoForm
        video={editingVideo}
        categories={categories}
        onSave={handleSaveVideo}
        onCancel={handleCancelVideoForm}
        isOpen={showVideoForm}
      />
    </div>
  )
}
