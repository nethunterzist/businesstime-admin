'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  Video, 
  Bell, 
  Zap, 
  Shield, 
  Archive,
  Save,
  RotateCcw,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  X,
  AlertTriangle,
  Activity,
  Database,
  Cloud
} from 'lucide-react'
import KPICardSkeleton from '@/components/skeletons/KPICardSkeleton'

interface AppSettings {
  appName: string
  description: string
  logoUrl: string
  autoPlayVideos: boolean
  enableSharing: boolean
  videoQuality: string
  enablePushNotifications: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
  cacheEnabled: boolean
  maxCacheSize: number
  cacheExpiryHours: number
  enableOfflineMode: boolean
  enableDarkMode: boolean
  enableAutoUpdate: boolean
  enableCrashReporting: boolean
  enablePerformanceMonitoring: boolean
}

interface SettingsPageProps {
  initialTab?: string;
}

export default function SettingsPage({ initialTab }: SettingsPageProps = {}) {
  const [settings, setSettings] = useState<AppSettings>({
    appName: 'Business Time',
    description: 'İş dünyasından en güncel haberler, eğitimler ve içerikler',
    logoUrl: '',
    autoPlayVideos: true,
    enableSharing: true,
    videoQuality: '720p',
    enablePushNotifications: false,
    maintenanceMode: false,
    maintenanceMessage: 'Uygulama şu anda bakım modunda. Lütfen daha sonra tekrar deneyin.',
    cacheEnabled: true,
    maxCacheSize: 500,
    cacheExpiryHours: 24,
    enableOfflineMode: true,
    enableDarkMode: true,
    enableAutoUpdate: true,
    enableCrashReporting: true,
    enablePerformanceMonitoring: true
  })

  const [activeTab, setActiveTab] = useState(initialTab || 'general')
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'general'
  })

  // Page content states
  const [pageContents, setPageContents] = useState({
    privacy_policy: '',
    terms_of_service: '',
    help_support: '',
    about: ''
  })
  const [pageContentChanges, setPageContentChanges] = useState({
    privacy_policy: false,
    terms_of_service: false,
    help_support: false,
    about: false
  })

  // Search settings states
  const [searchSettings, setSearchSettings] = useState({
    suggested_tags: 'Girişimcilik, Yatırım, Teknoloji, Kadın Girişimciler, Startup, İnovasyon, Pazarlama, Liderlik'
  })
  const [searchSettingsChanges, setSearchSettingsChanges] = useState(false)

  // Branding settings states
  const [brandingSettings, setBrandingSettings] = useState({
    welcome_screen_background: '',
    welcome_screen_logo: '',
    welcome_screen_title: 'Business Time TV\'ye Hoşgeldiniz',
    welcome_screen_subtitle: 'İş dünyasından en güncel haberler ve eğitimler',
    primary_color: '#9d1112',
    secondary_color: '#1a1a1a'
  })
  const [brandingSettingsChanges, setBrandingSettingsChanges] = useState(false)

  // Load settings from shared data on component mount
  useEffect(() => {
    loadSettings()
    loadPageContents()
    loadSearchSettings()
    loadBrandingSettings()
  }, [])

  const loadSearchSettings = async () => {
    try {
      console.log('🔍 Loading search settings from Supabase...')
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Raw search settings data:', data.settings)
        
        if (data.settings.suggested_search_tags) {
          setSearchSettings({
            suggested_tags: data.settings.suggested_search_tags
          })
          console.log('✅ Search settings loaded:', data.settings.suggested_search_tags)
        } else {
          console.log('⚠️ No suggested_search_tags found, using defaults')
        }
      } else {
        console.log('❌ Failed to load search settings')
      }
    } catch (error) {
      console.error('❌ Error loading search settings:', error)
    }
  }

  const loadBrandingSettings = async () => {
    try {
      console.log('🎨 Loading branding settings from Supabase...')
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        console.log('🎨 Raw branding settings data:', data.settings)
        
        const branding = {
          welcome_screen_background: data.settings.welcome_screen_background || '',
          welcome_screen_logo: data.settings.welcome_screen_logo || '',
          welcome_screen_title: data.settings.welcome_screen_title || 'Business Time TV\'ye Hoşgeldiniz',
          welcome_screen_subtitle: data.settings.welcome_screen_subtitle || 'İş dünyasından en güncel haberler ve eğitimler',
          primary_color: data.settings.primary_color || '#9d1112',
          secondary_color: data.settings.secondary_color || '#1a1a1a'
        }
        
        setBrandingSettings(branding)
        console.log('✅ Branding settings loaded:', branding)
      } else {
        console.log('❌ Failed to load branding settings')
      }
    } catch (error) {
      console.error('❌ Error loading branding settings:', error)
    }
  }

  const loadSettings = async () => {
    try {
      console.log('📂 Loading settings from Supabase...')
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        
        // Key mapping - API'den gelen snake_case'i camelCase'e çevir
        const mappedSettings = {
          ...settings,
          ...data.settings,
          // Snake case'den camelCase'e mapping
          enablePushNotifications: data.settings.enable_push_notifications ?? settings.enablePushNotifications,
          autoPlayVideos: data.settings.auto_play_videos ?? settings.autoPlayVideos,
          enableSharing: data.settings.enable_sharing ?? settings.enableSharing,
          videoQuality: data.settings.video_quality_default ?? settings.videoQuality,
          maintenanceMode: data.settings.maintenance_mode ?? settings.maintenanceMode,
          appName: data.settings.app_name ?? settings.appName,
          logoUrl: data.settings.logo_url ?? settings.logoUrl,
          description: data.settings.description ?? settings.description,
        }
        
        setSettings(mappedSettings)
        console.log('✅ Settings loaded and mapped:', mappedSettings)
      } else {
        console.log('❌ Failed to load settings, using defaults')
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPageContents = async () => {
    try {
      console.log('📄 Loading page contents from Supabase...')
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Raw settings data:', data.settings)
        
        // Extract page content from settings with better error handling
        const contents = {
          privacy_policy: '',
          terms_of_service: '',
          help_support: '',
          about: ''
        }

        // Helper function to safely parse JSON content
        const safeParseContent = (rawContent, fallback = '') => {
          try {
            if (!rawContent) return fallback
            
            // If it's already a string, return it
            if (typeof rawContent === 'string' && !rawContent.startsWith('{')) {
              return rawContent
            }
            
            // If it's an object, try to get content property
            if (typeof rawContent === 'object' && rawContent.content) {
              return rawContent.content
            }
            
            // Try to parse as JSON
            const parsed = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent
            return parsed.content || fallback
          } catch (error) {
            console.warn(`⚠️ Failed to parse content, using fallback:`, error)
            return fallback
          }
        }

        contents.privacy_policy = safeParseContent(data.settings.privacy_policy_content, 'Gizlilik politikası içeriği yükleniyor...')
        contents.terms_of_service = safeParseContent(data.settings.terms_of_service_content, 'Kullanım koşulları içeriği yükleniyor...')
        contents.help_support = safeParseContent(data.settings.help_support_content, 'Yardım içeriği yükleniyor...')
        contents.about = safeParseContent(data.settings.about_content, 'Hakkında içeriği yükleniyor...')
        
        setPageContents(contents)
        console.log('✅ Page contents loaded:', contents)
      } else {
        console.log('❌ Failed to load page contents, using defaults')
      }
    } catch (error) {
      console.error('❌ Error loading page contents:', error)
    }
  }


  const tabs = [
    { id: 'general', name: 'Genel Ayarlar', icon: Settings },
    { id: 'video', name: 'Video Ayarları', icon: Video },
    { id: 'search', name: 'Arama Ayarları', icon: Activity },
    { id: 'branding', name: 'Görsel Ayarları', icon: Cloud },
    { id: 'performance', name: 'Performans', icon: Zap },
    { id: 'security', name: 'Güvenlik', icon: Shield },
    { id: 'backup', name: 'Yedekleme', icon: Archive }
  ]

  const updateSetting = (key: keyof AppSettings, value: any, autoSave = false) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
    
    // Belirli ayarlar için otomatik kayıt
    if (autoSave) {
      // Önce state'i güncelle, sonra kaydet
      setTimeout(async () => {
        try {
          const updatedSettings = { ...settings, [key]: value }
          
          // CamelCase'den snake_case'e mapping
          const apiSettings = {
            ...updatedSettings,
            enable_push_notifications: updatedSettings.enablePushNotifications,
            auto_play_videos: updatedSettings.autoPlayVideos,
            enable_sharing: updatedSettings.enableSharing,
            video_quality_default: updatedSettings.videoQuality,
            maintenance_mode: updatedSettings.maintenanceMode,
            app_name: updatedSettings.appName,
            logo_url: updatedSettings.logoUrl,
            description: updatedSettings.description,
          }
          
          console.log('💾 Auto-saving setting:', key, '=', value)
          console.log('🔄 Mapped API settings:', apiSettings)
          
          const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiSettings)
          })

          if (response.ok) {
            console.log('✅ Setting auto-saved successfully!')
            setHasChanges(false)
            
            // Kısa başarı bildirimi
            const notification = document.createElement('div')
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm'
            notification.textContent = 'Ayar kaydedildi ✓'
            document.body.appendChild(notification)
            
            setTimeout(() => {
              notification.remove()
            }, 2000)
          } else {
            throw new Error('Auto-save failed')
          }
        } catch (error) {
          console.error('❌ Error auto-saving setting:', error)
          
          // Hata bildirimi
          const notification = document.createElement('div')
          notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm'
          notification.textContent = 'Kayıt hatası! Tekrar deneyin.'
          document.body.appendChild(notification)
          
          setTimeout(() => {
            notification.remove()
          }, 3000)
        }
      }, 100)
    }
  }

  const saveSettings = async () => {
    try {
      console.log('💾 Saving settings:', settings)
      
      // CamelCase'den snake_case'e mapping
      const apiSettings = {
        ...settings,
        enable_push_notifications: settings.enablePushNotifications,
        auto_play_videos: settings.autoPlayVideos,
        enable_sharing: settings.enableSharing,
        video_quality_default: settings.videoQuality,
        maintenance_mode: settings.maintenanceMode,
        app_name: settings.appName,
        logo_url: settings.logoUrl,
        description: settings.description,
      }
      
      console.log('🔄 Mapped API settings for save:', apiSettings)
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiSettings)
      })

      if (response.ok) {
        console.log('✅ Settings saved successfully!')
        setHasChanges(false)
        
        // Show success notification
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
        notification.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
          Ayarlar başarıyla kaydedildi!
        `
        document.body.appendChild(notification)
        
        setTimeout(() => {
          notification.remove()
        }, 3000)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('❌ Error saving settings:', error)
      alert('Ayarlar kaydedilirken hata oluştu!')
    }
  }

  const resetSettings = () => {
    if (confirm('Tüm ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
      setSettings({
        appName: 'Business Time',
        description: 'İş dünyasından en güncel haberler, eğitimler ve içerikler',
        logoUrl: '',
        autoPlayVideos: true,
        enableSharing: true,
        videoQuality: '720p',
        enablePushNotifications: false,
        maintenanceMode: false,
        maintenanceMessage: 'Uygulama şu anda bakım modunda. Lütfen daha sonra tekrar deneyin.',
        cacheEnabled: true,
        maxCacheSize: 500,
        cacheExpiryHours: 24,
        enableOfflineMode: true,
        enableDarkMode: true,
        enableAutoUpdate: true,
        enableCrashReporting: true,
        enablePerformanceMonitoring: true
      })
      setHasChanges(true)
    }
  }

  const sendNotification = async () => {
    try {
      console.log('📨 Sending notification:', notificationForm)
      
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationForm)
      })

      if (response.ok) {
        console.log('✅ Notification sent successfully!')
        
        // Clear form
        setNotificationForm({
          title: '',
          message: '',
          type: 'general'
        })
        
        // Show success notification
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
        notification.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
          Bildirim başarıyla gönderildi!
        `
        document.body.appendChild(notification)
        
        setTimeout(() => {
          notification.remove()
        }, 3000)
      } else {
        throw new Error('Failed to send notification')
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error)
      alert('Bildirim gönderilirken hata oluştu!')
    }
  }

  const createBackup = async () => {
    try {
      console.log('📦 Creating backup...')
      
      // Collect all data for backup
      const backupData = {
        settings,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        type: 'manual_backup'
      }
      
      const dataStr = JSON.stringify(backupData, null, 2)
      const dataBlob = new Blob([dataStr], {type: 'application/json'})
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `businesstime-backup-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      console.log('✅ Backup created successfully!')
      
      // Show success notification
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
      notification.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        Yedekleme başarıyla oluşturuldu!
      `
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.remove()
      }, 3000)
    } catch (error) {
      console.error('❌ Error creating backup:', error)
      alert('Yedekleme oluşturulurken hata oluştu!')
    }
  }

  const exportSettings = () => {
    console.log('📤 Exporting settings...')
    
    const exportData = {
      ...settings,
      exportedAt: new Date().toISOString(),
      exportedBy: 'admin',
      appVersion: '1.0.0'
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], {type: 'application/json'})
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `businesstime-settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    console.log('✅ Settings exported successfully!')
  }

  // Page content functions
  const updatePageContent = (pageKey: keyof typeof pageContents, content: string) => {
    setPageContents(prev => ({ ...prev, [pageKey]: content }))
    setPageContentChanges(prev => ({ ...prev, [pageKey]: true }))
  }

  const savePageContent = async (pageKey: keyof typeof pageContents) => {
    try {
      console.log(`💾 Saving ${pageKey} content...`)
      console.log(`📝 Content to save:`, pageContents[pageKey])
      
      const contentData = {
        content: pageContents[pageKey],
        last_updated: new Date().toISOString(),
        updated_by: 'admin'
      }
      
      const requestBody = {
        [`${pageKey}_content`]: JSON.stringify(contentData)
      }
      
      console.log(`📤 Request body:`, requestBody)
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log(`📥 Response status:`, response.status)
      
      if (response.ok) {
        const responseData = await response.json()
        console.log(`✅ ${pageKey} content saved successfully!`, responseData)
        setPageContentChanges(prev => ({ ...prev, [pageKey]: false }))
        
        // Show success notification
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
        notification.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
          Sayfa içeriği başarıyla güncellendi!
        `
        document.body.appendChild(notification)
        
        setTimeout(() => {
          notification.remove()
        }, 3000)
      } else {
        const errorData = await response.text()
        console.error(`❌ API Error Response:`, errorData)
        throw new Error(`Failed to save ${pageKey} content: ${response.status} - ${errorData}`)
      }
    } catch (error) {
      console.error(`❌ Error saving ${pageKey} content:`, error)
      alert(`Sayfa içeriği kaydedilirken hata oluştu: ${error.message}`)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-48 h-7 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-80 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-8 px-6">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2 py-4 px-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Content Skeleton */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div>
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
              <div>
                <div className="w-40 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-full h-24 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="w-48 h-5 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="w-64 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h2>
            <p className="text-gray-600 mt-1">Uygulama ayarlarını yönetin ve yapılandırın</p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <AlertTriangle size={14} />
                Kaydedilmemiş değişiklikler
              </span>
            )}
            <Button onClick={exportSettings} variant="outline" className="flex items-center gap-2">
              <Upload size={16} />
              Dışa Aktar
            </Button>
            <Button onClick={resetSettings} variant="outline" className="flex items-center gap-2">
              <RotateCcw size={16} />
              Sıfırla
            </Button>
            <Button 
              onClick={saveSettings}
              disabled={!hasChanges}
              className="bg-[#9d1112] hover:bg-[#7a0d0e] text-white flex items-center gap-2"
            >
              <Save size={16} />
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#9d1112] text-[#9d1112]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent size={16} />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uygulama Adı
                  </label>
                  <Input
                    value={settings.appName}
                    onChange={(e) => updateSetting('appName', e.target.value)}
                    placeholder="Business Time TV"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <Input
                    value={settings.logoUrl}
                    onChange={(e) => updateSetting('logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uygulama Açıklaması
                </label>
                <Textarea
                  value={settings.description}
                  onChange={(e) => updateSetting('description', e.target.value)}
                  rows={3}
                  placeholder="Uygulama hakkında kısa açıklama..."
                />
              </div>

            </div>
          )}

          {/* Search Settings */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
                  <Activity size={18} />
                  Mobil Arama Ayarları
                </h4>
                <p className="text-sm text-blue-700 mb-4">
                  Mobil uygulamada kullanıcılara gösterilecek önerilen arama etiketlerini buradan yönetebilirsiniz.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Activity size={16} />
                  Önerilen Arama Etiketleri
                  {searchSettingsChanges && (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                      Değiştirildi
                    </span>
                  )}
                </h5>
                <p className="text-sm text-gray-600 mb-3">
                  Mobil uygulamada arama ekranında gösterilecek popüler etiketleri virgülle ayırarak yazın.
                </p>
                <Textarea
                  value={searchSettings.suggested_tags}
                  onChange={(e) => {
                    setSearchSettings(prev => ({ ...prev, suggested_tags: e.target.value }))
                    setSearchSettingsChanges(true)
                  }}
                  placeholder="Girişimcilik, Yatırım, Teknoloji, Kadın Girişimciler, Startup, İnovasyon, Pazarlama, Liderlik"
                  rows={4}
                  className="mb-3"
                />
                <Button 
                  onClick={async () => {
                    try {
                      console.log('💾 Saving search settings...')
                      
                      const response = await fetch('/api/settings', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          suggested_search_tags: searchSettings.suggested_tags
                        })
                      })

                      if (response.ok) {
                        console.log('✅ Search settings saved successfully!')
                        setSearchSettingsChanges(false)
                        
                        // Reload search settings to confirm update
                        await loadSearchSettings()
                        
                        // Show success notification
                        const notification = document.createElement('div')
                        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
                        notification.innerHTML = `
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20,6 9,17 4,12"></polyline>
                          </svg>
                          Arama ayarları başarıyla güncellendi!
                        `
                        document.body.appendChild(notification)
                        
                        setTimeout(() => {
                          notification.remove()
                        }, 3000)
                      } else {
                        throw new Error('Failed to save search settings')
                      }
                    } catch (error) {
                      console.error('❌ Error saving search settings:', error)
                      alert('Arama ayarları kaydedilirken hata oluştu!')
                    }
                  }}
                  className="bg-[#9d1112] hover:bg-[#7a0e0f] text-white"
                  disabled={!searchSettingsChanges}
                >
                  Arama Ayarlarını Güncelle
                </Button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Activity size={18} />
                  Önizleme
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Mobil uygulamada şu şekilde görünecek:
                </p>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Popüler Aramalar</p>
                  <div className="flex flex-wrap gap-2">
                    {searchSettings.suggested_tags.split(',').map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-yellow-600" size={18} />
                  <h4 className="font-medium text-yellow-900">Önemli Bilgi</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  Arama etiketleri değiştirildiğinde, mobil uygulamadaki arama ekranı otomatik olarak güncellenir.
                  Kullanıcıların sık aradığı konuları etiket olarak eklemeniz önerilir.
                </p>
              </div>
            </div>
          )}

          {/* Branding Settings */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-4 flex items-center gap-2">
                  <Cloud size={18} />
                  Welcome Screen Yönetimi
                </h4>
                <p className="text-sm text-purple-700 mb-4">
                  Mobil uygulamada splash screen sonrası gösterilecek welcome screen'i buradan özelleştirebilirsiniz.
                  Bu sistem App Store politikalarına uygun olarak tasarlanmıştır.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Cloud size={16} />
                  Welcome Screen Ayarları
                  {brandingSettingsChanges && (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                      Değiştirildi
                    </span>
                  )}
                </h5>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arka Plan Görseli URL
                      </label>
                      <Input
                        value={brandingSettings.welcome_screen_background}
                        onChange={(e) => {
                          setBrandingSettings(prev => ({ ...prev, welcome_screen_background: e.target.value }))
                          setBrandingSettingsChanges(true)
                        }}
                        placeholder="https://example.com/background.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo URL
                      </label>
                      <Input
                        value={brandingSettings.welcome_screen_logo}
                        onChange={(e) => {
                          setBrandingSettings(prev => ({ ...prev, welcome_screen_logo: e.target.value }))
                          setBrandingSettingsChanges(true)
                        }}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ana Başlık
                      </label>
                      <Input
                        value={brandingSettings.welcome_screen_title}
                        onChange={(e) => {
                          setBrandingSettings(prev => ({ ...prev, welcome_screen_title: e.target.value }))
                          setBrandingSettingsChanges(true)
                        }}
                        placeholder="Business Time TV'ye Hoşgeldiniz"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alt Başlık
                      </label>
                      <Input
                        value={brandingSettings.welcome_screen_subtitle}
                        onChange={(e) => {
                          setBrandingSettings(prev => ({ ...prev, welcome_screen_subtitle: e.target.value }))
                          setBrandingSettingsChanges(true)
                        }}
                        placeholder="İş dünyasından en güncel haberler ve eğitimler"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ana Renk
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={brandingSettings.primary_color}
                          onChange={(e) => {
                            setBrandingSettings(prev => ({ ...prev, primary_color: e.target.value }))
                            setBrandingSettingsChanges(true)
                          }}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={brandingSettings.primary_color}
                          onChange={(e) => {
                            setBrandingSettings(prev => ({ ...prev, primary_color: e.target.value }))
                            setBrandingSettingsChanges(true)
                          }}
                          placeholder="#9d1112"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İkincil Renk
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={brandingSettings.secondary_color}
                          onChange={(e) => {
                            setBrandingSettings(prev => ({ ...prev, secondary_color: e.target.value }))
                            setBrandingSettingsChanges(true)
                          }}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={brandingSettings.secondary_color}
                          onChange={(e) => {
                            setBrandingSettings(prev => ({ ...prev, secondary_color: e.target.value }))
                            setBrandingSettingsChanges(true)
                          }}
                          placeholder="#1a1a1a"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={async () => {
                    try {
                      console.log('💾 Saving branding settings...')
                      
                      const response = await fetch('/api/settings', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(brandingSettings)
                      })

                      if (response.ok) {
                        console.log('✅ Branding settings saved successfully!')
                        setBrandingSettingsChanges(false)
                        
                        // Show success notification
                        const notification = document.createElement('div')
                        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
                        notification.innerHTML = `
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20,6 9,17 4,12"></polyline>
                          </svg>
                          Görsel ayarları başarıyla güncellendi!
                        `
                        document.body.appendChild(notification)
                        
                        setTimeout(() => {
                          notification.remove()
                        }, 3000)
                      } else {
                        throw new Error('Failed to save branding settings')
                      }
                    } catch (error) {
                      console.error('❌ Error saving branding settings:', error)
                      alert('Görsel ayarları kaydedilirken hata oluştu!')
                    }
                  }}
                  className="bg-[#9d1112] hover:bg-[#7a0e0f] text-white mt-4"
                  disabled={!brandingSettingsChanges}
                >
                  Görsel Ayarlarını Güncelle
                </Button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Cloud size={18} />
                  Mobil Önizleme
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Welcome screen mobil uygulamada şu şekilde görünecek:
                </p>
                <div 
                  className="bg-white p-6 rounded-lg border border-gray-200 text-center relative overflow-hidden"
                  style={{
                    backgroundImage: brandingSettings.welcome_screen_background ? `url(${brandingSettings.welcome_screen_background})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '300px'
                  }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                    {brandingSettings.welcome_screen_logo && (
                      <img 
                        src={brandingSettings.welcome_screen_logo} 
                        alt="Logo" 
                        className="w-20 h-20 object-contain mb-4"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                    <h1 
                      className="text-2xl font-bold mb-2"
                      style={{ color: brandingSettings.primary_color }}
                    >
                      {brandingSettings.welcome_screen_title}
                    </h1>
                    <p 
                      className="text-sm opacity-90"
                      style={{ color: brandingSettings.secondary_color }}
                    >
                      {brandingSettings.welcome_screen_subtitle}
                    </p>
                    <div 
                      className="mt-4 px-6 py-2 rounded-full text-white font-medium"
                      style={{ backgroundColor: brandingSettings.primary_color }}
                    >
                      Başla
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-blue-600" size={18} />
                  <h4 className="font-medium text-blue-900">Store Policy Uyumlu</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Bu welcome screen sistemi App Store ve Google Play politikalarına tamamen uyumludur.
                  Native splash screen statik kalır, sadece welcome screen dinamik olarak değişir.
                </p>
              </div>
            </div>
          )}

          {/* Video Settings */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Varsayılan Video Kalitesi
                  </label>
                  <select
                    value={settings.videoQuality}
                    onChange={(e) => updateSetting('videoQuality', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="480p">480p</option>
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="4K">4K Ultra HD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Otomatik Video Oynatma</h4>
                    <p className="text-sm text-gray-600">Videoları otomatik olarak oynat</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoPlayVideos}
                      onChange={(e) => updateSetting('autoPlayVideos', e.target.checked, true)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>


                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Video Paylaşma</h4>
                    <p className="text-sm text-gray-600">Kullanıcıların video paylaşmasına izin ver</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableSharing}
                      onChange={(e) => updateSetting('enableSharing', e.target.checked, true)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* YENİ PUSH BİLDİRİM SİSTEMİ */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Bell size={18} />
                  Push Bildirim Yönetimi
                </h4>
                
                {/* Mevcut durum göstergesi */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Şu anki durum:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      settings.enablePushNotifications 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {settings.enablePushNotifications ? '🟢 Aktif' : '🔴 Pasif'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Raw değer: {JSON.stringify(settings.enablePushNotifications)}
                  </p>
                </div>

                {/* Kontrol butonları */}
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      console.log('🟢 ENABLE clicked');
                      setSettings(prev => ({ ...prev, enablePushNotifications: true }));
                      
                      // Direct API call
                      try {
                        const response = await fetch('/api/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ enable_push_notifications: true })
                        });
                        
                        if (response.ok) {
                          console.log('✅ Push notifications ENABLED successfully');
                          alert('Push bildirimleri AKTİF edildi!');
                        } else {
                          console.error('❌ Failed to enable');
                          alert('HATA: Aktif edilemedi');
                        }
                      } catch (error) {
                        console.error('❌ Error:', error);
                        alert('HATA: ' + error.message);
                      }
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    🟢 AKTİF ET
                  </button>
                  
                  <button
                    onClick={async () => {
                      console.log('🔴 DISABLE clicked');
                      setSettings(prev => ({ ...prev, enablePushNotifications: false }));
                      
                      // Direct API call
                      try {
                        const response = await fetch('/api/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ enable_push_notifications: false })
                        });
                        
                        if (response.ok) {
                          console.log('✅ Push notifications DISABLED successfully');
                          alert('Push bildirimleri PASİF edildi!');
                        } else {
                          console.error('❌ Failed to disable');
                          alert('HATA: Pasif edilemedi');
                        }
                      } catch (error) {
                        console.error('❌ Error:', error);
                        alert('HATA: ' + error.message);
                      }
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    🔴 PASİF ET
                  </button>
                </div>
                
                {/* Test butonu */}
                <button
                  onClick={() => {
                    console.log('🧪 Current settings:', settings);
                    alert(`enablePushNotifications: ${settings.enablePushNotifications}\nTip: ${typeof settings.enablePushNotifications}`);
                  }}
                  className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  🧪 DEBUG BİLGİSİ GÖSTER
                </button>
              </div>

              {/* Send Notification Form */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Bell size={18} />
                  Bildirim Gönder
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlık
                    </label>
                    <Input
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Bildirim başlığı..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mesaj
                    </label>
                    <Textarea
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      placeholder="Bildirim mesajı..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tip
                    </label>
                    <select
                      value={notificationForm.type}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="general">Genel</option>
                      <option value="new_video">Yeni Video</option>
                      <option value="trending">Trend</option>
                      <option value="update">Güncelleme</option>
                    </select>
                  </div>
                  <Button 
                    onClick={sendNotification}
                    disabled={!notificationForm.title || !notificationForm.message || !settings.enablePushNotifications}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Bell size={16} />
                    Bildirim Gönder
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
                  <Bell size={18} />
                  Bildirim Şablonları
                </h4>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h5 className="font-medium">Yeni Video Bildirimi</h5>
                    <p className="text-sm text-gray-600">"{settings.appName}" adlı kanalda yeni video: "{"{video_title}"}"</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h5 className="font-medium flex items-center gap-2">
                      <Activity size={16} />
                      Trending Video Bildirimi
                    </h5>
                    <p className="text-sm text-gray-600">Trend olan video: "{"{video_title}"}" - Şimdi izleyin!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Önbellek Sistemi</h4>
                  <p className="text-sm text-gray-600">Performansı artırmak için önbellek kullan</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cacheEnabled}
                    onChange={(e) => updateSetting('cacheEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>



              {/* Cache Settings */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Database size={18} />
                  Önbellek Ayarları
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maksimum Önbellek Boyutu (MB)
                    </label>
                    <Input
                      type="number"
                      value={settings.maxCacheSize}
                      onChange={(e) => updateSetting('maxCacheSize', parseInt(e.target.value))}
                      min="100"
                      max="2000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Önbellek Süresi (Saat)
                    </label>
                    <Input
                      type="number"
                      value={settings.cacheExpiryHours}
                      onChange={(e) => updateSetting('cacheExpiryHours', parseInt(e.target.value))}
                      min="1"
                      max="168"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Bakım Modu</h4>
                  <p className="text-sm text-gray-600">Uygulamayı geçici olarak kapatma</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {settings.maintenanceMode && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-red-600" size={18} />
                    <h4 className="font-medium text-red-900">Bakım Modu Aktif</h4>
                  </div>
                  <p className="text-sm text-red-700">
                    Uygulama şu anda bakım modunda. Kullanıcılar uygulamaya erişemeyecek.
                  </p>
                </div>
              )}

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Shield size={18} />
                  Güvenlik Kontrolleri
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SSL Sertifikası</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <CheckCircle size={12} />
                      Aktif
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Firewall Koruması</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <CheckCircle size={12} />
                      Aktif
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">DDoS Koruması</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <CheckCircle size={12} />
                      Aktif
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Veri Şifreleme</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <CheckCircle size={12} />
                      Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
                  <Database size={18} />
                  Otomatik Yedekleme
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-600">Günlük</div>
                    <div className="text-sm text-gray-600">Son: 2 saat önce</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-600">Haftalık</div>
                    <div className="text-sm text-gray-600">Son: 3 gün önce</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-600">Aylık</div>
                    <div className="text-sm text-gray-600">Son: 15 gün önce</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={createBackup}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Archive size={16} />
                  Manuel Yedekleme Oluştur
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => alert('Yedekten geri yükleme özelliği yakında eklenecek!')}
                >
                  <Download size={16} />
                  Yedekten Geri Yükle
                </Button>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-yellow-600" size={18} />
                  <h4 className="font-medium text-yellow-900">Yedekleme Uyarısı</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  Yedekleme işlemleri sırasında sistem performansı etkilenebilir. 
                  Yoğun saatlerde manuel yedekleme yapmaktan kaçının.
                </p>
              </div>
            </div>
          )}

          {/* Page Management */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-medium text-green-900 mb-4 flex items-center gap-2">
                  <Database size={18} />
                  Yasal Sayfa Yönetimi
                </h4>
                <p className="text-sm text-green-700 mb-4">
                  Uygulama içerisindeki yasal sayfaların içeriklerini buradan düzenleyebilirsiniz.
                </p>
              </div>

              <div className="space-y-4">
                {/* Privacy Policy */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Shield size={16} />
                    Gizlilik Politikası
                    {pageContentChanges.privacy_policy && (
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                        Değiştirildi
                      </span>
                    )}
                  </h5>
                  <Textarea
                    value={pageContents.privacy_policy}
                    onChange={(e) => updatePageContent('privacy_policy', e.target.value)}
                    placeholder="Gizlilik politikası içeriği..."
                    rows={6}
                    className="mb-3"
                  />
                  <Button 
                    onClick={() => savePageContent('privacy_policy')}
                    className="bg-[#9d1112] hover:bg-[#7a0e0f] text-white"
                    disabled={!pageContentChanges.privacy_policy}
                  >
                    Gizlilik Politikasını Güncelle
                  </Button>
                </div>

                {/* Terms of Service */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Database size={16} />
                    Kullanım Koşulları
                    {pageContentChanges.terms_of_service && (
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                        Değiştirildi
                      </span>
                    )}
                  </h5>
                  <Textarea
                    value={pageContents.terms_of_service}
                    onChange={(e) => updatePageContent('terms_of_service', e.target.value)}
                    placeholder="Kullanım koşulları içeriği..."
                    rows={6}
                    className="mb-3"
                  />
                  <Button 
                    onClick={() => savePageContent('terms_of_service')}
                    className="bg-[#9d1112] hover:bg-[#7a0e0f] text-white"
                    disabled={!pageContentChanges.terms_of_service}
                  >
                    Kullanım Koşullarını Güncelle
                  </Button>
                </div>

              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="text-blue-600" size={18} />
                  <h4 className="font-medium text-blue-900">Bilgi</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Sayfa içerikleri değiştirildiğinde, mobil uygulamadaki ilgili sayfalar otomatik olarak güncellenir.
                  App Store ve Google Play politikalarına uygun içerik hazırladığınızdan emin olun.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
