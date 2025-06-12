#!/bin/bash
# Build script for Render deployment

set -e  # Exit on any error

echo "🚀 Starting build process for BOLAO Frontend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Verify TailwindCSS is installed
echo "🔍 Verifying TailwindCSS installation..."
npm list tailwindcss || echo "⚠️ TailwindCSS not found, this may cause build issues"

# Build the Next.js application
echo "🔨 Building Next.js application..."
npm run build

# Verify build output exists
echo "🔍 Verifying build output..."
if [ -d ".next" ]; then
    echo "✅ .next directory created successfully"
    ls -la .next/
else
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"
