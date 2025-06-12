#!/bin/bash
# Build script for Render deployment

echo "🚀 Starting build process for BOLAO Frontend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the Next.js application
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
