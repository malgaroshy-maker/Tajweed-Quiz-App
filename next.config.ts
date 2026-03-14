import withPWA from 'next-pwa'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Minimal Turbopack config to avoid the error
  turbopack: {},
}

// Wrap with PWA. Note: next-pwa is primarily built for webpack. 
// For Turbopack (Next.js 16), PWA manifest will still be generated, 
// but service worker caching may require a custom setup.
export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  icon: '/icon.png',
})(nextConfig)
