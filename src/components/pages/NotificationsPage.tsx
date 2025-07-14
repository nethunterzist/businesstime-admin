'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bell, 
  Send,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react'
import KPICardSkeleton from '@/components/skeletons/KPICardSkeleton'

interface AppSettings {
  enablePushNotifications: boolean
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    enablePushNotifications: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'general'
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      console.log('📂 Loading notification settings from Supabase...')
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        
        const mappedSettings = {
          enablePushNotifications: data.settings.enable_push_notifications ?? false,
        }
        
        setSettings(mappedSettings)
        console.log('✅ Notification settings loaded:', mappedSettings)
      } else {
        console.log('❌ Failed to load notification settings, using defaults')
      }
    } catch (error) {
      console.error('❌ Error loading notification settings:', error)
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-64 h-7 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-96 h-4 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>

        {/* Status Card Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-40 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-full h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Templates Skeleton */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-blue-200 rounded animate-pulse"></div>
            <div className="w-40 h-5 bg-blue-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="w-32 h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="space-y-1 mb-3">
                <div className="w-full h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="w-32 h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="space-y-1 mb-3">
                <div className="w-full h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
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
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="text-[#9d1112]" size={28} />
              Push Bildirim Yönetimi
            </h2>
            <p className="text-gray-600 mt-1">Mobil uygulamaya push bildirim gönderin ve ayarları yönetin</p>
          </div>
        </div>
      </div>

      {/* Push Notification Status */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Bell size={18} />
          Push Bildirim Durumu
        </h4>
        
        {/* Mevcut durum göstergesi */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Şu anki durum:</span>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              settings.enablePushNotifications 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {settings.enablePushNotifications ? '🟢 Aktif' : '🔴 Pasif'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Push bildirimler {settings.enablePushNotifications ? 'aktif' : 'pasif'} durumda. 
            {!settings.enablePushNotifications && ' Bildirim göndermek için önce aktif edin.'}
          </p>
        </div>

        {/* Kontrol butonları */}
        <div className="flex gap-3">
          <button
            onClick={async () => {
              console.log('🟢 ENABLE clicked');
              setSettings(prev => ({ ...prev, enablePushNotifications: true }));
              
              try {
                const response = await fetch('/api/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ enable_push_notifications: true })
                });
                
                if (response.ok) {
                  console.log('✅ Push notifications ENABLED successfully');
                  
                  // Show success notification
                  const notification = document.createElement('div')
                  notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
                  notification.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    Push bildirimleri aktif edildi!
                  `
                  document.body.appendChild(notification)
                  
                  setTimeout(() => {
                    notification.remove()
                  }, 3000)
                } else {
                  console.error('❌ Failed to enable');
                  alert('HATA: Aktif edilemedi');
                }
              } catch (error) {
                console.error('❌ Error:', error);
                alert('HATA: ' + error.message);
              }
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🟢 Push Bildirimleri Aktif Et
          </button>
          
          <button
            onClick={async () => {
              console.log('🔴 DISABLE clicked');
              setSettings(prev => ({ ...prev, enablePushNotifications: false }));
              
              try {
                const response = await fetch('/api/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ enable_push_notifications: false })
                });
                
                if (response.ok) {
                  console.log('✅ Push notifications DISABLED successfully');
                  
                  // Show success notification
                  const notification = document.createElement('div')
                  notification.className = 'fixed top-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
                  notification.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    Push bildirimleri pasif edildi!
                  `
                  document.body.appendChild(notification)
                  
                  setTimeout(() => {
                    notification.remove()
                  }, 3000)
                } else {
                  console.error('❌ Failed to disable');
                  alert('HATA: Pasif edilemedi');
                }
              } catch (error) {
                console.error('❌ Error:', error);
                alert('HATA: ' + error.message);
              }
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🔴 Push Bildirimleri Pasif Et
          </button>
        </div>
      </div>

      {/* Send Notification Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Send size={18} />
          Bildirim Gönder
        </h4>
        
        {!settings.enablePushNotifications && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-yellow-600" size={18} />
              <h4 className="font-medium text-yellow-900">Uyarı</h4>
            </div>
            <p className="text-sm text-yellow-700">
              Push bildirimleri pasif durumda. Bildirim göndermek için önce push bildirimleri aktif edin.
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bildirim Başlığı
            </label>
            <Input
              value={notificationForm.title}
              onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Örn: Yeni video yayınlandı!"
              disabled={!settings.enablePushNotifications}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bildirim Mesajı
            </label>
            <Textarea
              value={notificationForm.message}
              onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              placeholder="Bildirim mesajınızı buraya yazın..."
              disabled={!settings.enablePushNotifications}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bildirim Tipi
            </label>
            <select
              value={notificationForm.type}
              onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!settings.enablePushNotifications}
            >
              <option value="general">Genel Bildirim</option>
              <option value="new_video">Yeni Video</option>
              <option value="trending">Trend Video</option>
              <option value="update">Uygulama Güncellemesi</option>
            </select>
          </div>
          
          <Button 
            onClick={sendNotification}
            disabled={!notificationForm.title || !notificationForm.message || !settings.enablePushNotifications}
            className="bg-[#9d1112] hover:bg-[#7a0d0e] text-white flex items-center gap-2 w-full"
          >
            <Send size={16} />
            Bildirimi Gönder
          </Button>
        </div>
      </div>

      {/* Notification Templates */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
          <Activity size={18} />
          Bildirim Şablonları
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h5 className="font-medium text-gray-900 mb-2">Yeni Video Bildirimi</h5>
            <p className="text-sm text-gray-600 mb-3">
              <strong>Başlık:</strong> Yeni video yayınlandı!<br/>
              <strong>Mesaj:</strong> "Video Başlığı" adlı yeni videomuz yayında. Hemen izleyin!
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setNotificationForm({
                title: 'Yeni video yayınlandı!',
                message: 'İş dünyasından yeni videomuz yayında. Hemen izleyin!',
                type: 'new_video'
              })}
              disabled={!settings.enablePushNotifications}
            >
              Şablonu Kullan
            </Button>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h5 className="font-medium text-gray-900 mb-2">Trend Video Bildirimi</h5>
            <p className="text-sm text-gray-600 mb-3">
              <strong>Başlık:</strong> Trend olan video!<br/>
              <strong>Mesaj:</strong> Bu video şu anda çok izleniyor. Siz de kaçırmayın!
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setNotificationForm({
                title: 'Trend olan video!',
                message: 'Bu video şu anda çok izleniyor. Siz de kaçırmayın!',
                type: 'trending'
              })}
              disabled={!settings.enablePushNotifications}
            >
              Şablonu Kullan
            </Button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="text-green-600" size={18} />
          <h4 className="font-medium text-gray-900">Bilgi</h4>
        </div>
        <p className="text-sm text-gray-700">
          Push bildirimleri tüm mobil uygulama kullanıcılarına gönderilir. 
          Bildirim gönderilmeden önce içeriğinizi kontrol edin. 
          Spam olarak algılanmaması için günde maksimum 3-5 bildirim göndermeniz önerilir.
        </p>
      </div>
    </div>
  )
}
