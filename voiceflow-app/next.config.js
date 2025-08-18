const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone for Netlify - use default for Next.js runtime
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    serverComponentsExternalPackages: ['sharp', '@prisma/client', 'prisma'],
  },
  // Optimize for file uploads
  serverRuntimeConfig: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  publicRuntimeConfig: {
    maxFileSize: '25mb',
  },
  webpack: (config, { dev, isServer }) => {
    // Only enable tree shaking in production
    if (!dev) {
      config.optimization.usedExports = true;
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
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Accept-Encoding' },
          { key: 'Content-Encoding', value: 'gzip' },
        ],
      },
      {
        source: '/api/transcribe-local',
        headers: [
          { key: 'Content-Encoding', value: 'gzip' },
          { key: 'Transfer-Encoding', value: 'chunked' },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);