'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { 
  Folder, 
  CheckCircle, 
  Video, 
  BarChart3, 
  Plus, 
  Edit2, 
  Play, 
  Pause, 
  Trash2,
  Save,
  X,
  Calendar,
  Link,
  Smile,
  Heart,
  Star,
  Zap,
  Target,
  Flame,
  Mic,
  Search,
  Film,
  Camera,
  Monitor,
  // Daha fazla icon ekleyelim
  Activity,
  Airplay,
  AlertCircle,
  Archive,
  Award,
  Bell,
  Bookmark,
  Box,
  Briefcase,
  Calculator,
  Cast,
  Clock,
  Cloud,
  Code,
  Coffee,
  Compass,
  CreditCard,
  Database,
  Download,
  Droplets,
  Gift,
  Globe,
  Headphones,
  Home,
  Image,
  Inbox,
  Info,
  Key,
  Layers,
  Layout,
  Lock,
  Mail,
  Map,
  Menu,
  MessageCircle,
  Music,
  Navigation,
  Package,
  Phone,
  PieChart,
  Settings,
  Shield,
  ShoppingCart,
  Smartphone,
  Speaker,
  Sun,
  Tag,
  Trash,
  Truck,
  TrendingUp,
  Tv,
  Upload,
  User,
  Users,
  Wifi,
  Zap as Lightning
} from 'lucide-react'
import CategoryListItemSkeleton from '@/components/skeletons/CategoryListItemSkeleton'

interface Category {
  id: string
  name: string
  description: string
  color: string
  icon: React.ReactElement
  iconName?: string
  slug: string
  videoCount: number
  isActive: boolean
  createdAt: string
}

// Comprehensive icon library
const allIcons = [
  { name: 'Activity', component: Activity },
  { name: 'Airplay', component: Airplay },
  { name: 'AlertCircle', component: AlertCircle },
  { name: 'Archive', component: Archive },
  { name: 'Award', component: Award },
  { name: 'BarChart3', component: BarChart3 },
  { name: 'Bell', component: Bell },
  { name: 'Bookmark', component: Bookmark },
  { name: 'Box', component: Box },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Calculator', component: Calculator },
  { name: 'Calendar', component: Calendar },
  { name: 'Camera', component: Camera },
  { name: 'Cast', component: Cast },
  { name: 'CheckCircle', component: CheckCircle },
  { name: 'Clock', component: Clock },
  { name: 'Cloud', component: Cloud },
  { name: 'Code', component: Code },
  { name: 'Coffee', component: Coffee },
  { name: 'Compass', component: Compass },
  { name: 'CreditCard', component: CreditCard },
  { name: 'Database', component: Database },
  { name: 'Download', component: Download },
  { name: 'Droplets', component: Droplets },
  { name: 'Film', component: Film },
  { name: 'Flame', component: Flame },
  { name: 'Folder', component: Folder },
  { name: 'Gift', component: Gift },
  { name: 'Globe', component: Globe },
  { name: 'Headphones', component: Headphones },
  { name: 'Heart', component: Heart },
  { name: 'Home', component: Home },
  { name: 'Image', component: Image },
  { name: 'Inbox', component: Inbox },
  { name: 'Info', component: Info },
  { name: 'Key', component: Key },
  { name: 'Layers', component: Layers },
  { name: 'Layout', component: Layout },
  { name: 'Link', component: Link },
  { name: 'Lock', component: Lock },
  { name: 'Mail', component: Mail },
  { name: 'Map', component: Map },
  { name: 'Menu', component: Menu },
  { name: 'MessageCircle', component: MessageCircle },
  { name: 'Mic', component: Mic },
  { name: 'Monitor', component: Monitor },
  { name: 'Music', component: Music },
  { name: 'Navigation', component: Navigation },
  { name: 'Package', component: Package },
  { name: 'Phone', component: Phone },
  { name: 'PieChart', component: PieChart },
  { name: 'Search', component: Search },
  { name: 'Settings', component: Settings },
  { name: 'Shield', component: Shield },
  { name: 'ShoppingCart', component: ShoppingCart },
  { name: 'Smartphone', component: Smartphone },
  { name: 'Smile', component: Smile },
  { name: 'Speaker', component: Speaker },
  { name: 'Star', component: Star },
  { name: 'Sun', component: Sun },
  { name: 'Tag', component: Tag },
  { name: 'Target', component: Target },
  { name: 'Trash', component: Trash },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'Truck', component: Truck },
  { name: 'Tv', component: Tv },
  { name: 'Upload', component: Upload },
  { name: 'User', component: User },
  { name: 'Users', component: Users },
  { name: 'Video', component: Video },
  { name: 'Wifi', component: Wifi },
  { name: 'Zap', component: Zap },
  { name: 'Lightning', component: Lightning }
]


// Icon options removed - using comprehensive icon picker instead
const colorOptions = ['#ff6b35', '#4dabf7', '#51cf66', '#ffd43b', '#9775fa', '#ff8cc8', '#20c997', '#fd7e14', '#6f42c1', '#dc3545']

// Icon helper functions
const getIconByName = (iconName: string) => {
  const iconData = allIcons.find(icon => icon.name === iconName)
  return iconData ? React.createElement(iconData.component, { size: 20 }) : <Folder size={20} />
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [iconSearchTerm, setIconSearchTerm] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#ff6b35',
    icon: <Folder size={20} />,
    iconName: 'Folder'
  })

  // Load categories on component mount
  useEffect(() => {
    loadCategoriesFromSupabase()
  }, [])

  // Filter icons based on search term
  const filteredIcons = allIcons.filter(icon => 
    icon.name.toLowerCase().includes(iconSearchTerm.toLowerCase())
  )

  // Individual saves handled by specific actions

  // Load categories from Supabase
  const loadCategoriesFromSupabase = async () => {
    try {
      console.log('📂 Loading categories from Supabase...')
      const response = await fetch('/api/categories')

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Categories loaded from Supabase:', data)
        
        // Get video counts for each category
        const videoResponse = await fetch('/api/videos')
        let videoCounts: { [key: string]: number } = {}
        
        if (videoResponse.ok) {
          const videoData = await videoResponse.json()
          videoCounts = videoData.videos.reduce((acc: { [key: string]: number }, video: { category_id?: string }) => {
            if (video.category_id) {
              acc[video.category_id] = (acc[video.category_id] || 0) + 1
            }
            return acc
          }, {})
        }
        
        // Transform Supabase data to frontend format
        const transformedCategories = data.categories.map((cat: { 
          id: string; 
          name: string; 
          description?: string; 
          color?: string; 
          icon?: string; 
          slug?: string; 
          is_featured?: boolean; 
          created_at?: string 
        }) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          color: cat.color || '#ff6b35',
          icon: getIconByName(cat.icon || 'Folder'),
          iconName: cat.icon || 'Folder',
          slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
          videoCount: videoCounts[cat.id] || 0,
          isActive: cat.is_featured !== false,
          createdAt: cat.created_at ? new Date(cat.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }))
        
        setCategories(transformedCategories)
      } else {
        console.log('❌ Failed to load categories from Supabase')
      }
    } catch (error) {
      console.error('❌ Error loading categories from Supabase:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Select icon from picker
  const selectIcon = (iconName: string) => {
    const iconComponent = getIconByName(iconName)
    setNewCategory({ ...newCategory, icon: iconComponent, iconName })
    setShowIconPicker(false)
    setIconSearchTerm('')
  }

  // Open icon picker
  const openIconPicker = () => {
    setShowIconPicker(true)
    setIconSearchTerm('')
  }

  const addCategory = async () => {
    if (newCategory.name.trim()) {
      try {
        const categoryData = {
          name: newCategory.name,
          description: newCategory.description,
          color: newCategory.color,
          icon: newCategory.iconName || 'Folder',
          slug: newCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          is_featured: true,
          sort_order: categories.length
        }

        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData)
        })

        if (response.ok) {
          await loadCategoriesFromSupabase()
          setNewCategory({ name: '', description: '', color: '#ff6b35', icon: <Folder size={20} />, iconName: 'Folder' })
          setShowAddForm(false)
          toast.success('Kategori başarıyla eklendi!')
        } else {
          const errorData = await response.json()
          console.error('Failed to add category:', errorData)
          toast.error(`Kategori ekleme hatası: ${errorData.error || 'Bilinmeyen hata'}`)
        }
      } catch (error) {
        console.error('Error adding category:', error)
        toast.error(`Kategori ekleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
      }
    }
  }

  const handleDeleteClick = async (id: string) => {
    // Önce bu kategoride video var mı kontrol et
    try {
      const response = await fetch('/api/videos')
      if (response.ok) {
        const data = await response.json()
        const videosInCategory = data.videos.filter((video: { category_id?: string }) => video.category_id === id)
        
        if (videosInCategory.length > 0) {
          toast.error(`Bu kategoride ${videosInCategory.length} video bulunuyor. Önce videoları başka bir kategoriye taşıyın veya silin.`)
          return
        }
      }
    } catch (error) {
      console.error('Error checking videos:', error)
    }

    setCategoryToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      const response = await fetch(`/api/categories/${categoryToDelete}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadCategoriesFromSupabase()
        toast.success('Kategori başarıyla silindi!')
      } else {
        const errorData = await response.json()
        console.error('Failed to delete category:', errorData)
        toast.error(`Kategori silme hatası: ${errorData.error || 'Bilinmeyen hata'}`)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error(`Kategori silme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    } finally {
      setCategoryToDelete(null)
      setShowDeleteConfirm(false)
    }
  }

  const toggleCategoryStatus = (id: string) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
    ))
  }

  const startEdit = (category: Category) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      iconName: category.iconName || 'Folder'
    })
    setShowAddForm(true)
  }

  const saveEdit = async () => {
    if (editingCategory) {
      try {
        const updateData = {
          name: newCategory.name,
          description: newCategory.description,
          color: newCategory.color,
          icon: newCategory.iconName || 'Folder',
          slug: newCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        }

        const response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })

        if (response.ok) {
          await loadCategoriesFromSupabase()
          setEditingCategory(null)
          setNewCategory({ name: '', description: '', color: '#ff6b35', icon: <Folder size={20} />, iconName: 'Folder' })
          setShowAddForm(false)
          toast.success('Kategori başarıyla güncellendi!')
        } else {
          const errorData = await response.json()
          console.error('Failed to update category:', errorData)
          toast.error(`Kategori güncelleme hatası: ${errorData.error || 'Bilinmeyen hata'}`)
        }
      } catch (error) {
        console.error('Error updating category:', error)
      }
    }
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setNewCategory({ name: '', description: '', color: '#ff6b35', icon: <Folder size={20} />, iconName: 'Folder' })
    setShowAddForm(false)
  }

  return (
    <div className="space-y-6">

      {/* Add Category Button */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Kategori Yönetimi</h2>
            <p className="text-gray-600 text-sm mt-1">Video kategorilerini ekleyin, düzenleyin ve yönetin</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-[#9d1112] hover:bg-[#7a0d0e] text-white flex items-center gap-2"
          >
            <Plus size={16} />
            Yeni Kategori
          </Button>
        </div>
      </div>

      {/* Add/Edit Category Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              {editingCategory ? <Edit2 size={20} className="text-blue-600" /> : <Plus size={20} className="text-blue-600" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Adı *
                </label>
                <Input
                  placeholder="Örn: Teknoloji Haberleri"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <Textarea
                  placeholder="Kategori hakkında kısa açıklama..."
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori İkonu
                </label>
                <div className="space-y-3">
                  {/* Selected Icon Display */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200">
                      {newCategory.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{newCategory.iconName}</p>
                      <p className="text-sm text-gray-600">Seçili ikon</p>
                    </div>
                  </div>
                  
                  {/* Browse Icons Button */}
                  <button
                    type="button"
                    onClick={openIconPicker}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Search size={20} />
                      <span className="font-medium">İkon Gözat ({allIcons.length} ikon mevcut)</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Rengi
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCategory({...newCategory, color})}
                      className={`w-12 h-12 rounded-lg border-4 transition-transform ${
                        newCategory.color === color 
                          ? 'border-gray-400 scale-110' 
                          : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Önizleme:</p>
                <div 
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: newCategory.color }}
                >
                  <span>{newCategory.icon}</span>
                  <span>{newCategory.name || 'Kategori Adı'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button 
              onClick={editingCategory ? saveEdit : addCategory}
              disabled={!newCategory.name.trim()}
              className="bg-[#9d1112] hover:bg-[#7a0d0e] text-white flex items-center gap-2"
            >
              <Save size={16} />
              {editingCategory ? 'Güncelle' : 'Kategori Ekle'}
            </Button>
            <Button 
              onClick={cancelEdit}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X size={16} />
              İptal
            </Button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Mevcut Kategoriler</h3>
          <p className="text-sm text-gray-600 mt-1">{categories.length} kategori bulundu</p>
        </div>

        <div className="p-6">
          <div className="grid gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <CategoryListItemSkeleton key={index} />
              ))
            ) : (
              categories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: category.color }}
                >
                  {category.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Video size={12} />
                      {category.videoCount} video
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(category)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => toggleCategoryStatus(category.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      category.isActive
                        ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {category.isActive ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">İkon Seçin</h3>
                  <p className="text-sm text-gray-600 mt-1">{filteredIcons.length} ikon bulundu</p>
                </div>
                <button
                  onClick={() => setShowIconPicker(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="İkon ara... (örn: video, music, star)"
                    value={iconSearchTerm}
                    onChange={(e) => setIconSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Icons Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredIcons.length > 0 ? (
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                  {filteredIcons.map((iconData) => {
                    const IconComponent = iconData.component
                    const isSelected = newCategory.iconName === iconData.name
                    
                    return (
                      <button
                        key={iconData.name}
                        onClick={() => selectIcon(iconData.name)}
                        className={`group p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        title={iconData.name}
                      >
                        <IconComponent size={24} className="mx-auto" />
                        <div className={`text-xs mt-2 truncate ${
                          isSelected ? 'text-blue-600 font-medium' : 'text-gray-600'
                        }`}>
                          {iconData.name}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Search size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-2">İkon bulunamadı</p>
                  <p className="text-sm text-gray-500">Arama teriminizi değiştirin veya farklı kelimeler deneyin</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Toplam {allIcons.length} ikon • Lucide Icons kütüphanesi
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowIconPicker(false)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <X size={16} />
                    İptal
                  </Button>
                  {newCategory.iconName && (
                    <Button
                      onClick={() => setShowIconPicker(false)}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <Save size={16} />
                      Seçimi Onayla
                    </Button>
                  )}
                </div>
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
          setCategoryToDelete(null)
        }}
        onConfirm={confirmDeleteCategory}
        title="Kategori Sil"
        message="Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Evet, Sil"
        cancelText="İptal"
        type="danger"
      />
    </div>
  )
}
