'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SliderItemSkeleton from '@/components/skeletons/SliderItemSkeleton';
import KPICardSkeleton from '@/components/skeletons/KPICardSkeleton';

interface FeaturedContent {
  id: string;
  title: string;
  image_url: string;
  action_type: 'video' | 'category' | 'external_url';
  action_value: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function SliderManagementPage() {
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [videoSearchTerm, setVideoSearchTerm] = useState('');
  const [filteredVideos, setFilteredVideos] = useState<any[]>([]);
  const [showVideoDropdown, setShowVideoDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<FeaturedContent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    action_type: 'video' as 'video' | 'category' | 'external_url',
    action_value: '',
    is_active: true
  });

  useEffect(() => {
    fetchFeaturedContent();
    fetchCategories();
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      console.log('🎬 Loading videos for slider dropdown...');
      const response = await fetch('/api/videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
        console.log('✅ Videos loaded for slider:', data.videos?.length || 0);
      } else {
        console.log('❌ Failed to load videos for slider');
        setVideos([]);
      }
    } catch (error) {
      console.error('❌ Error loading videos for slider:', error);
      setVideos([]);
    }
  };

  // Video search functionality
  useEffect(() => {
    if (videoSearchTerm.trim() === '') {
      setFilteredVideos([]);
      setShowVideoDropdown(false);
    } else {
      const filtered = videos.filter(video => 
        video.title.toLowerCase().includes(videoSearchTerm.toLowerCase())
      );
      setFilteredVideos(filtered.slice(0, 10)); // Limit to 10 results
      setShowVideoDropdown(filtered.length > 0);
    }
  }, [videoSearchTerm, videos]);

  const handleVideoSelect = (video: any) => {
    setFormData({...formData, action_value: video.id});
    setVideoSearchTerm(video.title);
    setShowVideoDropdown(false);
  };

  const fetchCategories = async () => {
    try {
      console.log('📂 Loading categories for slider dropdown...');
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        console.log('✅ Categories loaded for slider:', data.categories?.length || 0);
      } else {
        console.log('❌ Failed to load categories for slider');
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Error loading categories for slider:', error);
      setCategories([]);
    }
  };

  const fetchFeaturedContent = async () => {
    try {
      const response = await fetch('/api/featured-content');
      const data = await response.json();
      
      if (response.ok) {
        setFeaturedContent(data.featuredContent || []);
        console.log('✅ Featured content loaded from Supabase:', data.featuredContent?.length || 0);
      } else {
        // Table doesn't exist yet - show empty state
        console.log('⚠️ Featured content table does not exist yet');
        setFeaturedContent([]);
      }
    } catch (error) {
      // API error - show empty state
      console.log('❌ Featured content API error:', error);
      setFeaturedContent([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingItem 
        ? `/api/featured-content/${editingItem.id}`
        : '/api/featured-content';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sort_order: editingItem?.sort_order || featuredContent.length + 1
        }),
      });

      if (response.ok) {
        await fetchFeaturedContent();
        resetForm();
        alert(editingItem ? '✅ Slider içeriği güncellendi!' : '✅ Yeni slider içeriği eklendi!');
      } else {
        const data = await response.json();
        console.error('Error saving:', data.error);
        alert('❌ Kaydetme hatası: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('❌ Bağlantı hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  const handleEdit = (item: FeaturedContent) => {
    setFormData({
      title: item.title,
      image_url: item.image_url,
      action_type: item.action_type,
      action_value: item.action_value,
      is_active: item.is_active
    });
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/featured-content/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchFeaturedContent();
        alert('✅ Slider içeriği silindi!');
      } else {
        const data = await response.json();
        console.error('Error deleting item:', data.error);
        alert('❌ Silme hatası: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('❌ Bağlantı hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
    setDeleteId(null);
  };

  const toggleActive = async (item: FeaturedContent) => {
    try {
      const response = await fetch(`/api/featured-content/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          is_active: !item.is_active
        }),
      });

      if (response.ok) {
        await fetchFeaturedContent();
        alert(`✅ Slider içeriği ${!item.is_active ? 'aktif' : 'pasif'} hale getirildi!`);
      } else {
        const data = await response.json();
        console.error('Error toggling active status:', data.error);
        alert('❌ Durum değiştirme hatası: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('❌ Bağlantı hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  const moveItem = async (fromIndex: number, toIndex: number) => {
    const newItems = [...featuredContent];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    // Update sort orders
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      sort_order: index + 1
    }));

    setFeaturedContent(updatedItems);

    // Save to backend
    try {
      await fetch('/api/featured-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: updatedItems.map(item => ({ id: item.id, sort_order: item.sort_order }))
        }),
      });
      console.log('✅ Slider sıralaması güncellendi!');
    } catch (error) {
      console.error('Error updating sort order:', error);
      // Revert on error
      await fetchFeaturedContent();
      alert('❌ Sıralama güncelleme hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      action_type: 'video',
      action_value: '',
      is_active: true
    });
    setVideoSearchTerm('');
    setShowVideoDropdown(false);
    setEditingItem(null);
    setShowForm(false);
  };

  const getActionDescription = (type: string, value: string) => {
    switch (type) {
      case 'video':
        const video = videos.find(vid => vid.id === value);
        return `Video: ${video ? video.title : value}`;
      case 'category':
        const category = categories.find(cat => cat.id === value);
        return `Kategori: ${category ? category.name : value}`;
      case 'external_url':
        return `URL: ${value}`;
      default:
        return value;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Slider Yönetimi</h1>
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
        </div>

        {/* Info Card Skeleton */}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
          <div className="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>

        {/* Slider Items Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <SliderItemSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Slider Yönetimi</h1>
        <Button onClick={() => setShowForm(true)}>
          Yeni İçerik Ekle
        </Button>
      </div>

      {/* Info message about table status */}
      {featuredContent.length === 0 && !isLoading && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <span>⚠️</span>
            <span className="font-medium">Tablo Bulunamadı:</span>
          </div>
          <p className="text-yellow-700 mt-1 text-sm">
            featured_content tablosu henüz oluşturulmamış. Slider içeriği eklemek için önce tabloyu oluşturmanız gerekiyor.
          </p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 bg-white">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'İçerik Düzenle' : 'Yeni İçerik Ekle'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Başlık</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Slider başlığı"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Görsel URL</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Eylem Tipi</label>
                <select
                  value={formData.action_type}
                  onChange={(e) => setFormData({...formData, action_type: e.target.value as any, action_value: ''})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="video">Video Aç</option>
                  <option value="category">Kategori Listele</option>
                  <option value="external_url">Harici URL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {formData.action_type === 'video' && 'Video Seçin'}
                  {formData.action_type === 'category' && 'Kategori Seçin'}
                  {formData.action_type === 'external_url' && 'URL'}
                </label>
                
                {formData.action_type === 'category' ? (
                  <select
                    value={formData.action_value}
                    onChange={(e) => setFormData({...formData, action_value: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Kategori seçin...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                ) : formData.action_type === 'video' ? (
                  <div className="relative">
                    <Input
                      value={videoSearchTerm}
                      onChange={(e) => setVideoSearchTerm(e.target.value)}
                      placeholder="Video başlığı yazın..."
                      onFocus={() => setShowVideoDropdown(filteredVideos.length > 0)}
                      onBlur={() => setTimeout(() => setShowVideoDropdown(false), 200)}
                    />
                    {showVideoDropdown && filteredVideos.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredVideos.map((video) => (
                          <div
                            key={video.id}
                            onClick={() => handleVideoSelect(video)}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                {video.thumbnail_url && (
                                  <img
                                    src={video.thumbnail_url}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {video.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {video.views || 0} görüntüleme
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    value={formData.action_value}
                    onChange={(e) => setFormData({...formData, action_value: e.target.value})}
                    placeholder="https://example.com"
                    required
                  />
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <label htmlFor="is_active" className="text-sm">Aktif</label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingItem ? 'Güncelle' : 'Ekle'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  İptal
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Content List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <SliderItemSkeleton key={index} />
          ))
        ) : (
          featuredContent.map((item, index) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center space-x-4">
              {/* Drag Handle */}
              <div className="flex flex-col space-y-1 cursor-move">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => index > 0 && moveItem(index, index - 1)}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => index < featuredContent.length - 1 && moveItem(index, index + 1)}
                  disabled={index === featuredContent.length - 1}
                >
                  ↓
                </Button>
              </div>

              {/* Image Preview */}
              <div className="w-20 h-12 bg-gray-200 rounded overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content Info */}
              <div className="flex-1">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-gray-500">
                  {getActionDescription(item.action_type, item.action_value)}
                </p>
                <p className="text-xs text-gray-400">
                  Sıra: {item.sort_order} • 
                  {item.is_active ? ' Aktif' : ' Pasif'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(item)}
                  className={item.is_active 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700'
                  }
                >
                  {item.is_active ? 'Aktif' : 'Pasif'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                >
                  Düzenle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteId(item.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Sil
                </Button>
              </div>
            </div>
          </Card>
          ))
        )}

        {!isLoading && featuredContent.length === 0 && (
          <Card className="p-8 text-center text-gray-500">
            Henüz slider içeriği eklenmemiş.
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="İçeriği Sil"
        message="Bu slider içeriğini silmek istediğinize emin misiniz?"
      />
    </div>
  );
}
