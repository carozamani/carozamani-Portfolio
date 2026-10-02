import type { NextConfig } from 'next';

const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api').origin;

const nextConfig: NextConfig = {
  reactCompiler: true,
  // uploaded images are stored as same-origin /uploads/... paths and served by the backend
  async rewrites() {
    return [{ source: '/uploads/:path*', destination: `${apiOrigin}/uploads/:path*` }];
  },
};

export default nextConfig;
