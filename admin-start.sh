#!/bin/bash

# Global BusinessTime Admin Starter
# Bu script her yerden çalıştırılabilir

ADMIN_DIR="/Applications/XAMPP/xamppfiles/htdocs/app/businesstime-admin"

echo "🚀 BusinessTime Admin Global Starter"
echo "======================================"
echo "📂 Dizin: $ADMIN_DIR"

# Admin dizinine git
cd "$ADMIN_DIR"

# Dizinin var olup olmadığını kontrol et
if [ ! -d "$ADMIN_DIR" ]; then
    echo "❌ Admin dizini bulunamadı: $ADMIN_DIR"
    exit 1
fi

# start-dev.sh'nin var olup olmadığını kontrol et
if [ ! -f "start-dev.sh" ]; then
    echo "❌ start-dev.sh dosyası bulunamadı"
    exit 1
fi

# Parametreleri geçir
echo "🔄 Admin server başlatılıyor..."
./start-dev.sh $@