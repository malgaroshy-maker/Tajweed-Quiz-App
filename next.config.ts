import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Turbopack enabled
  turbopack: {},
  serverExternalPackages: ['pdf2json']
}

export default nextConfig
