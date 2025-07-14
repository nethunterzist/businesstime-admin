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
  Activity,
  Users,
  TrendingUp,
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react'

interface PushSettings {
  isEnabled: boolean
  totalDevices: number
  lastNotification: {
    title: string
    createdAt: string
  } | null
}

interface NotificationForm {
  title: string
  message: string
  type: 'general' | 'video' | 'update' | 'trending'
}

interface NotificationHistory {
  id: string
  title: string
  message: string
  type: string
  created_at: string
  sent_at: string | null
  total_sent: number
  total_failed: number
}

export default function PushNotificationPage() {
  const [settings, setSettings] = useState<PushSettings>({
    isEnabled: false,
    totalDevices: 0,
    lastNotification: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [notificationForm, setNotificationForm] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'general'
  })
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadSettings()
    loadNotificationHistory()
  }, [])

  const loadSettings = async () => {
    try {
      console.log('📊 Loading push notification settings...')
      const response = await fetch('/api/push/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        console.log('✅ Push settings loaded:', data)
      } else {
        console.error('❌ Failed to load push settings')
        throw new Error('Failed to load settings')
      }
    } catch (error) {
      console.error('❌ Error loading push settings:', error)
      showNotification('Ayarlar yüklenirken hata oluştu', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const loadNotificationHistory = async () => {
    try {
      const response = await fetch('/api/push/send')
      if (response.ok) {
        const data = await response.json()
        setNotificationHistory(data.notifications || [])
      }
    } catch (error) {
      console.error('❌ Error loading notification history:', error)
    }
  }

  const togglePushNotifications = async (enabled: boolean) => {
    setIsToggling(true)
    try {
      console.log(`🔄 ${enabled ? 'Enabling' : 'Disabling'} push notifications...`)
      
      const response = await fetch('/api/push/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: enabled })
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, isEnabled: data.isEnabled }))
        
        showNotification(
          `Push bildirimleri ${enabled ? 'aktif' : 'pasif'} edildi!`,
          'success'
        )
        
        console.log(`✅ Push notifications ${enabled ? 'enabled' : 'disabled'}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Toggle failed')
      }
    } catch (error) {
      console.error('❌ Error toggling push notifications:', error)
      showNotification(
        `Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        'error'
      )
    } finally {
      setIsToggling(false)
    }
  }

  const sendNotification = async () => {
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      showNotification('Başlık ve mesaj gerekli', 'error')
      return
    }

    setIsSending(true)
    try {
      console.log('📨 Sending push notification:', notificationForm)
      
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationForm)
      })

      if (response.ok) {
        const data = await response.json()
        
        // Clear form
        setNotificationForm({
          title: '',
          message: '',
          type: 'general'
        })
        
        // Reload settings and history
        await loadSettings()
        await loadNotificationHistory()
        
        showNotification(
          `Bildirim ${data.stats.totalSent} cihaza başarıyla gönderildi!`,
          'success'
        )
        
        console.log('✅ Notification sent successfully:', data)
      } else {
        const errorData = await response.json()
        console.error('❌ Send notification failed:', errorData)
        
        // Özel hata mesajları
        if (errorData.error === 'No active devices found for push notifications') {
          showNotification(
            'Henüz kayıtlı cihaz yok. Mobile app\'i açıp push notification permission verin.',
            'error'
          )
        } else {
          showNotification(
            `Hata: ${errorData.error || 'Bilinmeyen hata'}`,
            'error'
          )
        }
        return
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error)
      showNotification(
        `Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        'error'
      )
    } finally {
      setIsSending(false)
    }
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`
    notification.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'success' 
          ? '<polyline points="20,6 9,17 4,12"></polyline>'
          : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
        }
      </svg>
      ${message}
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 4000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-64 h-7 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-96 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-full h-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
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
              Push Bildirim Sistemi
            </h2>
            <p className="text-gray-600 mt-1">Mobil uygulamaya gerçek zamanlı push bildirim gönderin</p>
          </div>
          <Button
            onClick={() => {
              loadSettings()
              loadNotificationHistory()
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Yenile
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kayıtlı Cihazlar</p>
              <p className="text-2xl font-bold text-gray-900">{settings.totalDevices}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Push Durumu</p>
              <p className={`text-2xl font-bold ${settings.isEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {settings.isEnabled ? 'Aktif' : 'Pasif'}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${settings.isEnabled ? 'bg-green-100' : 'bg-red-100'}`}>
              <Activity className={settings.isEnabled ? 'text-green-600' : 'text-red-600'} size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Son Bildirim</p>
              <p className="text-sm text-gray-900">
                {settings.lastNotification 
                  ? formatDate(settings.lastNotification.createdAt)
                  : 'Henüz bildirim yok'
                }
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Push Notification Toggle */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Activity size={18} />
          Push Bildirim Kontrolü
        </h4>
        
        <div className="flex gap-4">
          <Button
            onClick={() => togglePushNotifications(true)}
            disabled={isToggling || settings.isEnabled}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            {isToggling ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Push Bildirimleri Aktif Et
          </Button>
          
          <Button
            onClick={() => togglePushNotifications(false)}
            disabled={isToggling || !settings.isEnabled}
            variant="destructive"
            className="flex items-center gap-2"
          >
            {isToggling ? <RefreshCw size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
            Push Bildirimleri Pasif Et
          </Button>
        </div>
      </div>

      {/* Send Notification Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Send size={18} />
          Bildirim Gönder
        </h4>
        
        {!settings.isEnabled && (
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
              disabled={!settings.isEnabled || isSending}
              maxLength={100}
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
              disabled={!settings.isEnabled || isSending}
              maxLength={500}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bildirim Tipi
            </label>
            <select
              value={notificationForm.type}
              onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!settings.isEnabled || isSending}
            >
              <option value="general">Genel Bildirim</option>
              <option value="video">Yeni Video</option>
              <option value="trending">Trend Video</option>
              <option value="update">Uygulama Güncellemesi</option>
            </select>
          </div>
          
          <Button 
            onClick={sendNotification}
            disabled={!notificationForm.title || !notificationForm.message || !settings.isEnabled || isSending}
            className="bg-[#9d1112] hover:bg-[#7a0d0e] text-white flex items-center gap-2 w-full"
          >
            {isSending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
            {isSending ? 'Gönderiliyor...' : 'Bildirimi Gönder'}
          </Button>
        </div>
      </div>

      {/* Notification History */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <BarChart3 size={18} />
            Bildirim Geçmişi
          </h4>
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="outline"
            size="sm"
          >
            {showHistory ? 'Gizle' : 'Göster'}
          </Button>
        </div>
        
        {showHistory && (
          <div className="space-y-3">
            {notificationHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Henüz bildirim gönderilmemiş</p>
            ) : (
              notificationHistory.map((notification) => (
                <div key={notification.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{notification.title}</h5>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      notification.type === 'general' ? 'bg-blue-100 text-blue-800' :
                      notification.type === 'video' ? 'bg-green-100 text-green-800' :
                      notification.type === 'trending' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {notification.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(notification.created_at)}</span>
                    <span>{notification.total_sent} gönderildi, {notification.total_failed} başarısız</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Quick Templates */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
          <TrendingUp size={18} />
          Hızlı Şablonlar
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h5 className="font-medium text-gray-900 mb-2">Yeni Video Bildirimi</h5>
            <p className="text-sm text-gray-600 mb-3">
              <strong>Başlık:</strong> Yeni video yayınlandı!<br/>
              <strong>Mesaj:</strong> İş dünyasından yeni videomuz yayında. Hemen izleyin!
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setNotificationForm({
                title: 'Yeni video yayınlandı!',
                message: 'İş dünyasından yeni videomuz yayında. Hemen izleyin!',
                type: 'video'
              })}
              disabled={!settings.isEnabled || isSending}
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
              disabled={!settings.isEnabled || isSending}
            >
              Şablonu Kullan
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
