#!/bin/bash

echo "🔥 BUSINESSTIME - FOREVER FIX SCRIPT"
echo "===================================="

# 1. Kill ALL conflicting processes
echo "💀 Tüm Node.js conflicts temizleniyor..."
pkill -f "jest-worker" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true

# 2. Force kill port 3000
echo "🔫 Port 3000 force kill..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 3. Clear all caches
echo "🧹 ALL CACHES CLEANING..."
rm -rf .next
rm -rf node_modules/.cache
npm cache clean --force

# 4. Memory pressure release
echo "💾 Memory pressure release..."
purge 2>/dev/null || true

# 5. Start with ulimit protection
echo "🛡️  Setting ulimit protection..."
ulimit -n 4096
ulimit -u 2048

# 6. Start in background with nohup (network accessible)
echo "🚀 Starting in isolated background with network access..."
nohup npx next dev --port 3000 --hostname 0.0.0.0 > server.log 2>&1 &
SERVER_PID=$!
echo "📍 Server PID: $SERVER_PID"

# 7. Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
sleep 5

# 8. Check if server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ SERVER RUNNING: http://localhost:3000"
    echo "📋 Server PID: $SERVER_PID (saved to server.pid)"
    echo $SERVER_PID > server.pid
else
    echo "❌ Server failed to start"
    tail -20 server.log
fi

echo "🎯 To stop: kill \$(cat server.pid)"
