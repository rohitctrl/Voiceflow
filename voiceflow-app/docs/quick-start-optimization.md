# VoiceFlow Performance Optimization - Quick Start Guide

## 🚀 Phase 1: Frontend Optimization (Week 1-2)

This guide provides immediate, actionable steps to start optimizing VoiceFlow's performance. Follow these steps in order for the best results.

## 📦 Step 1: Bundle Size Reduction

### 1.1 Install Bundle Analysis Tools

```bash
cd voiceflow-app
npm install --save-dev webpack-bundle-analyzer @next/bundle-analyzer
```

### 1.2 Update Next.js Configuration

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  webpack: (config, { dev, isServer }) => {
    // Tree shaking optimization
    config.optimization.usedExports = true;
    
    // Bundle analyzer in development
    if (dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    
    return config;
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

module.exports = withBundleAnalyzer(nextConfig);
```

### 1.3 Create Loading Skeleton Components

```typescript
// components/ui/skeletons.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function VoiceRecorderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="flex justify-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
  );
}

export function FileUploadSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-lg border-2 border-dashed" />
      <div className="flex justify-center">
        <Skeleton className="h-10 w-32 rounded" />
      </div>
    </div>
  );
}

export function RecordingsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}
```

### 1.4 Implement Code Splitting in Dashboard

```typescript
// app/dashboard/page.tsx
'use client'

import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RecordingWithUser } from '@/types'
import { Mic, Upload, FileAudio, Sparkles } from 'lucide-react'
import { 
  VoiceRecorderSkeleton, 
  FileUploadSkeleton, 
  RecordingsListSkeleton 
} from '@/components/ui/skeletons'

// Lazy load heavy components
const VoiceRecorder = dynamic(() => import('@/components/voice/voice-recorder'), {
  loading: () => <VoiceRecorderSkeleton />,
  ssr: false // Disable SSR for audio components
})

const FileUploadZone = dynamic(() => import('@/components/upload/file-upload-zone'), {
  loading: () => <FileUploadSkeleton />
})

const RecordingsList = dynamic(() => import('@/components/dashboard/recordings-list'), {
  loading: () => <RecordingsListSkeleton />
})

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'record' | 'upload' | 'library'>('record')
  const [selectedRecording, setSelectedRecording] = useState<RecordingWithUser | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // ... existing code ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* ... existing header code ... */}
        
        <div className="mt-8">
          {activeTab === 'record' && (
            <Suspense fallback={<VoiceRecorderSkeleton />}>
              <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
            </Suspense>
          )}
          
          {activeTab === 'upload' && (
            <Suspense fallback={<FileUploadSkeleton />}>
              <FileUploadZone onFilesSelected={handleFilesSelected} />
            </Suspense>
          )}
          
          {activeTab === 'library' && (
            <Suspense fallback={<RecordingsListSkeleton />}>
              <RecordingsList 
                selectedRecording={selectedRecording}
                onRecordingSelect={setSelectedRecording}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  )
}
```

## 🎯 Step 2: Core Web Vitals Optimization

### 2.1 Add Font Optimization

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

### 2.2 Optimize Image Loading

```typescript
// components/ui/optimized-image.tsx
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`
          duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
        `}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  )
}
```

### 2.3 Add Resource Hints

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/api/recordings" as="fetch" crossOrigin="anonymous" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//api.openai.com" />
        <link rel="dns-prefetch" href="//api.anthropic.com" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

## 🔧 Step 3: Service Worker Implementation

### 3.1 Create Service Worker

```javascript
// public/sw.js
const CACHE_NAME = 'voiceflow-v1';
const STATIC_CACHE = 'voiceflow-static-v1';
const DYNAMIC_CACHE = 'voiceflow-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Handle API requests
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }
  
  // Handle static assets
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).then((fetchResponse) => {
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});
```

### 3.2 Register Service Worker

```typescript
// lib/service-worker.ts
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}
```

```typescript
// app/layout.tsx
import { registerServiceWorker } from '@/lib/service-worker'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Register service worker
  if (typeof window !== 'undefined') {
    registerServiceWorker();
  }

  return (
    <html lang="en" className={inter.className}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

### 3.3 Create PWA Manifest

```json
// public/manifest.json
{
  "name": "VoiceFlow - Voice Notes",
  "short_name": "VoiceFlow",
  "description": "AI-powered voice notes with transcription",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["productivity", "utilities"],
  "lang": "en"
}
```

## 📊 Step 4: Performance Monitoring

### 4.1 Add Performance Monitoring

```typescript
// lib/performance-monitor.ts
export class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;
  
  init() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handleMetric(entry);
        }
      });
      
      this.observer.observe({ 
        entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] 
      });
    }
  }
  
  private handleMetric(entry: PerformanceEntry) {
    const metric = {
      name: entry.name,
      value: entry.startTime,
      type: entry.entryType,
      timestamp: Date.now(),
    };
    
    // Send to analytics service
    this.sendMetric(metric);
  }
  
  private async sendMetric(metric: any) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.error('Failed to send metric:', error);
    }
  }
}
```

### 4.2 Initialize Performance Monitoring

```typescript
// app/layout.tsx
import { PerformanceMonitor } from '@/lib/performance-monitor'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize performance monitoring
  if (typeof window !== 'undefined') {
    const monitor = new PerformanceMonitor();
    monitor.init();
  }

  return (
    <html lang="en" className={inter.className}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

## 🧪 Step 5: Testing and Validation

### 5.1 Run Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true npm run build

# Check bundle size in development
npm run dev
# Open http://localhost:3000 to see bundle analyzer
```

### 5.2 Test Performance

```bash
# Build for production
npm run build

# Start production server
npm start

# Run Lighthouse audit
# Open Chrome DevTools > Lighthouse > Run audit
```

### 5.3 Validate PWA Features

```bash
# Test service worker
# Open Chrome DevTools > Application > Service Workers

# Test PWA installation
# Look for "Install" button in browser address bar
```

## 📈 Expected Results

After implementing these optimizations, you should see:

- **Bundle Size:** 30-40% reduction in initial JavaScript bundle
- **First Contentful Paint:** <1.5s on 3G
- **Largest Contentful Paint:** <2.5s on 3G
- **Cumulative Layout Shift:** <0.1
- **Lighthouse Score:** 80+ in all categories

## 🚀 Next Steps

After completing Phase 1:

1. **Monitor Performance:** Use the performance monitoring to track improvements
2. **Test on Mobile:** Verify optimizations work well on mobile devices
3. **Move to Phase 2:** Begin backend performance optimizations
4. **Document Results:** Record performance improvements for the team

## 🆘 Troubleshooting

### Common Issues:

1. **Service Worker Not Registering:**
   - Check browser console for errors
   - Verify HTTPS in production
   - Clear browser cache

2. **Bundle Size Not Reducing:**
   - Run bundle analyzer to identify large packages
   - Check for duplicate dependencies
   - Verify tree shaking is working

3. **Performance Not Improving:**
   - Check network throttling in DevTools
   - Verify optimizations are applied in production build
   - Test on actual mobile devices

This quick start guide provides immediate performance improvements. For comprehensive optimization, follow the full implementation plan in the main documentation.
