'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Bell, 
  Search,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react'

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

export default function NotificationHistoryPage() {
  const [notifications, setNotifications] = useState<NotificationHistory[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const notificationsPerPage = 20

  useEffect(() => {
    loadNotificationHistory()
  }, [])

  useEffect(() => {
    filterNotifications()
  }, [notifications, searchTerm, currentPage])

  const loadNotificationHistory = async () => {
    setIsLoading(true)
    try {
      console.log('📊 Loading notification history...')
      const response = await fetch('/api/push/send')
      if (response.ok) {
        const data = await response.json()
        const notificationList = data.notifications || []
        setNotifications(notificationList)
        console.log('✅ Notification history loaded:', notificationList.length)
      } else {
        console.error('❌ Failed to load notification history')
      }
    } catch (error) {
      console.error('❌ Error loading notification history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterNotifications = () => {
    let filtered = notifications

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower) ||
        notification.type.toLowerCase().includes(searchLower)
      )
    }

    // Calculate pagination
    const total = Math.ceil(filtered.length / notificationsPerPage)
    setTotalPages(total)

    // Apply pagination
    const startIndex = (currentPage - 1) * notificationsPerPage
    const paginatedNotifications = filtered.slice(startIndex, startIndex + notificationsPerPage)
    
    setFilteredNotifications(paginatedNotifications)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-800'
      case 'video':
        return 'bg-green-100 text-green-800'
      case 'trending':
        return 'bg-purple-100 text-purple-800'
      case 'update':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'general':
        return 'Genel'
      case 'video':
        return 'Video'
      case 'trending':
        return 'Trend'
      case 'update':
        return 'Güncelleme'
      default:
        return type
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getSuccessRate = (sent: number, failed: number) => {
    const total = sent + failed
    if (total === 0) return 0
    return Math.round((sent / total) * 100)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="w-64 h-7 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
          <div className="w-96 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>

        {/* Search Skeleton */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-full h-10 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>

        {/* Notifications Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-full h-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
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
              Bildirim Geçmişi
            </h2>
            <p className="text-gray-600 mt-1">
              Gönderilen tüm push bildirimlerin detaylı geçmişi
            </p>
          </div>
          <Button
            onClick={loadNotificationHistory}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Yenile
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Bildirim ara..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Bell size={16} />
              Toplam: {notifications.length}
            </span>
            <span className="flex items-center gap-1">
              <Users size={16} />
              Sayfa: {currentPage}/{totalPages}
            </span>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Bildirim bulunamadı' : 'Henüz bildirim yok'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Arama kriterlerinizi değiştirin veya farklı terimler deneyin'
                : 'Henüz hiç push bildirimi gönderilmemiş'
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div key={notification.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                      {getTypeLabel(notification.type)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(notification.created_at)}
                  </span>
                  {notification.sent_at && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Gönderildi: {formatDate(notification.sent_at)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm">
                    <CheckCircle size={14} className="text-green-600" />
                    <span className="text-green-600 font-medium">
                      {notification.total_sent} başarılı
                    </span>
                  </div>
                  
                  {notification.total_failed > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <AlertCircle size={14} className="text-red-600" />
                      <span className="text-red-600 font-medium">
                        {notification.total_failed} başarısız
                      </span>
                    </div>
                  )}

                  <div className="text-sm font-medium text-gray-700">
                    %{getSuccessRate(notification.total_sent, notification.total_failed)} başarı
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Sayfa {currentPage} / {totalPages} 
              <span className="ml-2">
                ({filteredNotifications.length} bildirim gösteriliyor)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                Önceki
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                onClick={() => goToPage(currentPage + 1)}
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
  )
}
