#!/bin/bash

echo "🚀 BUSINESSTIME ADMIN - STABLE DEVELOPMENT START"
echo "=================================================="

# 1. EXPO CONFLICT CHECK
echo "🔍 Expo server conflict kontrol ediliyor..."
EXPO_PID=$(ps aux | grep "expo start" | grep -v grep | awk '{print $2}')
if [ ! -z "$EXPO_PID" ]; then
  echo "⚠️  EXPO SERVER ÇALIŞIYOR - Bu conflict yaratabilir!"
  echo "📱 Expo PID: $EXPO_PID"
  echo "💡 Tavsiye: Expo server'ı farklı terminalde çalıştırın"
fi

# 2. Port kontrolü ve temizleme
echo "🔍 Port 3000 kontrol ediliyor..."
PID=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$PID" ]; then
  echo "📍 Process $PID bulundu, kapatılıyor..."
  kill -TERM $PID 2>/dev/null
  sleep 2
  kill -KILL $PID 2>/dev/null || true
  echo "✅ Process sonlandırıldı"
else
  echo "✅ Port 3000 zaten boş"
fi

# 3. Next.js process kontrolü (sadece admin için)
echo "🔍 Next.js process'leri kontrol ediliyor..."
pkill -f "next dev.*businesstime-admin" 2>/dev/null || true
pkill -f "next start.*businesstime-admin" 2>/dev/null || true
sleep 1

# 4. Memory cleanup
echo "🧹 Memory cleanup yapılıyor..."
pkill -f "jest-worker" 2>/dev/null || true

# 3. Cache temizleme (sadece gerekirse)
if [ "$1" = "clean" ]; then
  echo "🧹 Cache temizleniyor..."
  rm -rf .next
  echo "✅ Cache temizlendi"
fi

# 4. Environment check
echo "🔧 Environment kontrol ediliyor..."
if [ ! -f ".env.local" ]; then
  echo "❌ .env.local dosyası bulunamadı!"
  exit 1
fi

# 5. Dependencies check  
echo "📦 Dependencies kontrol ediliyor..."
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules bulunamadı, yükleniyor..."
  npm install
fi

# 6. Stable start
echo "🚀 Next.js başlatılıyor..."
echo "📍 URL: http://localhost:3000"
echo "⏰ Başlangıç zamanı: $(date)"
echo "=================================================="

# Set environment variables
export NODE_OPTIONS="--max-old-space-size=4096"
export PORT=3000
export HOSTNAME=localhost

# Start Next.js with process isolation
echo "🚀 Starting with process isolation..."
export NODE_OPTIONS="--max-old-space-size=4096 --disable-background-compilation"
export FORCE_COLOR=1
export NODE_ENV=development

# Start with process title for easy identification
exec -a "next-admin-server" npx next dev --port 3000 --hostname localhost