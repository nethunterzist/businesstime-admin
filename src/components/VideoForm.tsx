'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X, Upload, Play, Eye } from 'lucide-react'

interface Video {
  id?: number;
  title: string;
  description: string;
  url: string;
  category: string;
  thumbnail: string;
  tags?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}

interface VideoFormProps {
  video?: Video | null;
  categories: string[];
  onSave: (video: Video) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export default function VideoForm({ video, categories, onSave, onCancel, isOpen }: VideoFormProps) {
  console.log('🎬 VideoForm rendered with props:', { video, categories, isOpen })
  
  const [formData, setFormData] = useState<Video>({
    title: video?.title || '',
    description: video?.description || '',
    url: video?.url || '',
    category: video?.category || '',
    thumbnail: video?.thumbnail || '',
    tags: video?.tags || '',
    isPublished: video?.isPublished || false,
    isFeatured: video?.isFeatured || false
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Video başlığı gerekli'
    }
    
    if (!formData.url.trim()) {
      newErrors.url = 'Video URL\'si gerekli'
    } else if (!isValidVideoUrl(formData.url)) {
      newErrors.url = 'Geçerli bir video URL\'si girin'
    }
    
    if (!formData.category) {
      newErrors.category = 'Kategori seçimi gerekli'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidVideoUrl = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || 
           url.includes('youtube.com') || url.includes('vimeo.com') || url.includes('b-cdn.net')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📝 Form submitted with data:', formData)
    
    if (validateForm()) {
      console.log('✅ Form validation passed')
      onSave(formData)
      resetForm()
    } else {
      console.log('❌ Form validation failed')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      category: '',
      thumbnail: '',
      tags: '',
      isPublished: false,
      isFeatured: false
    })
    setErrors({})
  }

  const handleCancel = () => {
    console.log('❌ Form cancelled')
    resetForm()
    onCancel()
  }

  const generateThumbnail = () => {
    // Basit thumbnail generator
    const thumbnails = [
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'
    ]
    
    const randomThumbnail = thumbnails[Math.floor(Math.random() * thumbnails.length)]
    setFormData(prev => ({ ...prev, thumbnail: randomThumbnail }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {video ? 'Video Düzenle' : 'Yeni Video Ekle'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Video bilgilerini doldurun ve kaydedin
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sol Panel - Temel Bilgiler */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Başlığı *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Örn: İş Dünyasından Haberler"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Video hakkında detaylı açıklama..."
                  rows={4}
                />
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
                <label className="block text-sm font-bold text-red-600 mb-2">
                  🏷️ ETİKETLER (YENİ ALAN)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="girişimcilik, startup, teknoloji, yatırım"
                  className="border-2 border-yellow-400"
                />
                <p className="text-xs text-gray-700 mt-1 font-medium">
                  ⚠️ Etiketleri virgülle ayırarak yazın. Arama sonuçlarında daha kolay bulunması için kullanılır.
                </p>
                
                {/* Popüler Etiket Önerileri */}
                <div className="mt-3 bg-white p-3 rounded border">
                  <p className="text-xs font-bold text-blue-600 mb-2">🔥 Popüler Etiketler:</p>
                  <div className="flex flex-wrap gap-2">
                    {['girişimcilik', 'startup', 'teknoloji', 'yatırım', 'pazarlama', 'liderlik', 'kadın girişimciler', 'inovasyon'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
                          if (!currentTags.includes(tag)) {
                            const newTags = [...currentTags, tag].join(', ')
                            setFormData(prev => ({ ...prev, tags: newTags }))
                          }
                        }}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL *
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/video.mp4"
                    className={errors.url ? 'border-red-500' : ''}
                  />
                  {formData.url && (
                    <Button
                      type="button"
                      onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                      variant="outline"
                      className="px-3"
                    >
                      <Eye size={16} />
                    </Button>
                  )}
                </div>
                {errors.url && (
                  <p className="text-red-500 text-sm mt-1">{errors.url}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full p-3 border rounded-lg bg-white ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Sağ Panel - Thumbnail ve Ayarlar */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <div className="space-y-3">
                  <Input
                    value={formData.thumbnail}
                    onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                  
                  {formData.thumbnail && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Thumbnail Önizleme:</p>
                      <img 
                        src={formData.thumbnail} 
                        alt="Thumbnail preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Video Önizleme */}
              {isPreviewOpen && formData.url && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Video Önizleme:</p>
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video 
                      controls 
                      className="w-full h-40"
                      src={formData.url}
                    >
                      Tarayıcınız video oynatmayı desteklemiyor.
                    </video>
                  </div>
                </div>
              )}

              {/* Ayarlar */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Video Ayarları</h3>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Yayınla</h4>
                    <p className="text-sm text-gray-600">Videoyu hemen yayınla</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Öne Çıkar</h4>
                    <p className="text-sm text-gray-600">Ana sayfada öne çıkar</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-[#9d1112] hover:bg-[#7a0d0e] text-white"
            >
              {video ? 'Video Güncelle' : 'Video Ekle'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
