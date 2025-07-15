'use client'

import { useState, ReactNode, useEffect } from 'react'
import { 
  BarChart3, 
  Video, 
  Folder, 
  Settings, 
  Moon,
  Sun,
  LogOut,
  User,
  Image,
  Flag,
  Bell,
  Database
} from 'lucide-react'

interface LayoutProps {
  children: ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => ReactNode
}

interface MenuItem {
  id: string
  name: string
  icon: ReactNode
  description: string
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: <BarChart3 size={20} />,
    description: 'Ana gösterge paneli'
  },
  {
    id: 'videos',
    name: 'Videolar',
    icon: <Video size={20} />,
    description: 'Video yönetimi'
  },
  {
    id: 'categories',
    name: 'Kategoriler',
    icon: <Folder size={20} />,
    description: 'Kategori yönetimi'
  },
  {
    id: 'slider',
    name: 'Slider Yönetimi',
    icon: <Image size={20} />,
    description: 'Öne çıkan içerik slider\'ı'
  },
  {
    id: 'notifications',
    name: 'Bildirimler',
    icon: <Bell size={20} />,
    description: 'Push bildirim yönetimi'
  },
  {
    id: 'notification-history',
    name: 'Bildirim Geçmişi',
    icon: <BarChart3 size={20} />,
    description: 'Gönderilen bildirim geçmişi'
  },
  {
    id: 'pages',
    name: 'Sayfa Yönetimi',
    icon: <Database size={20} />,
    description: 'Yasal sayfa içerikleri'
  },
  {
    id: 'reports',
    name: 'Rapor Edilenler',
    icon: <Flag size={20} />,
    description: 'İçerik bildirimleri'
  },
  {
    id: 'settings',
    name: 'Ayarlar',
    icon: <Settings size={20} />,
    description: 'Sistem ayarları'
  }
]

export default function Layout({ children }: LayoutProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true'
    }
    return false
  })

  // Apply dark mode to document - RADIKAL ÇÖZÜM
  useEffect(() => {
    console.log('🌙 Dark mode state changed:', isDarkMode)
    
    // Multiple approaches to ensure dark mode works
    const htmlElement = document.documentElement
    const bodyElement = document.body
    
    if (isDarkMode) {
      // Method 1: Tailwind classes
      htmlElement.classList.add('dark')
      bodyElement.classList.add('dark')
      
      // Method 2: Data attribute
      htmlElement.setAttribute('data-theme', 'dark')
      bodyElement.setAttribute('data-theme', 'dark')
      
      // Method 3: CSS variables
      htmlElement.style.setProperty('--background', '0 0% 3.9%')
      htmlElement.style.setProperty('--foreground', '0 0% 98%')
      htmlElement.style.setProperty('--card', '0 0% 3.9%')
      
      // Method 4: Direct style override - Premium dark gray
      bodyElement.style.backgroundColor = '#0a0a0a'
      bodyElement.style.color = '#e4e4e7'
      
      console.log('✅ Dark mode applied with multiple methods')
    } else {
      // Remove all dark mode indicators
      htmlElement.classList.remove('dark')
      bodyElement.classList.remove('dark')
      htmlElement.setAttribute('data-theme', 'light')
      bodyElement.setAttribute('data-theme', 'light')
      
      // Reset CSS variables
      htmlElement.style.setProperty('--background', '0 0% 100%')
      htmlElement.style.setProperty('--foreground', '0 0% 3.9%')
      htmlElement.style.setProperty('--card', '0 0% 100%')
      
      // Reset direct styles - Premium light
      bodyElement.style.backgroundColor = '#fafafa'
      bodyElement.style.color = '#0a0a0a'
      
      console.log('☀️ Light mode applied')
    }
    
    // Save preference
    localStorage.setItem('darkMode', isDarkMode.toString())
    console.log('💾 Dark mode preference saved:', isDarkMode)
    
    // Force re-render by changing a CSS custom property
    document.documentElement.style.setProperty('--force-update', Math.random().toString())
  }, [isDarkMode])

  const toggleDarkMode = () => {
    console.log('🔄 Toggle dark mode clicked. Current state:', isDarkMode)
    const newMode = !isDarkMode
    console.log('🔄 New mode will be:', newMode)
    setIsDarkMode(newMode)
  }

  const handleLogout = async () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      try {
        console.log('🚪 Initiating logout...')
        
        // Call logout API to clear cookie
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          console.log('✅ Logout successful')
          // Clear any local storage if needed
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
          
          // Redirect to login page
          window.location.href = '/login'
        } else {
          console.error('❌ Logout failed')
          // Force redirect anyway for security
          window.location.href = '/login'
        }
      } catch (error) {
        console.error('❌ Logout error:', error)
        // Force redirect anyway for security
        window.location.href = '/login'
      }
    }
  }

  return (
    <div className="min-h-screen">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="https://businesstimetv.org/assets/images/logo.png" 
                  alt="Business Time Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">Business Time</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-[#9d1112] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-xs ${activeTab === item.id ? 'text-red-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </nav>

        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {menuItems.find(item => item.id === activeTab)?.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {menuItems.find(item => item.id === activeTab)?.description}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString('tr-TR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={isDarkMode ? 'Açık moda geç' : 'Koyu moda geç'}
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Admin</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Yönetici</p>
                  </div>
                  <div className="w-8 h-8 bg-[#9d1112] rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Çıkış yap"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
            {children({ activeTab, setActiveTab })}
          </main>
        </div>
      </div>
    </div>
  )
}
