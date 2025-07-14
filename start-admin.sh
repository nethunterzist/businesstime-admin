#!/bin/bash

# BusinessTime Admin Dashboard Startup Script
# Sabit port 4000'de çalışır

echo "🚀 Starting BusinessTime Admin Dashboard..."
echo "📍 Port: 4000"
echo "🌐 URL: http://localhost:4000"
echo "📱 Mobile API: http://192.168.1.64:4000"
echo ""

# Kill any existing processes on port 4000
echo "🧹 Cleaning port 4000..."
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

# Start the admin dashboard
echo "⚡ Starting admin dashboard..."
npm run dev -- --port 4000